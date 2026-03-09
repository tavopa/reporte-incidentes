"""
incident_handler.py
────────────────────
Manages the incident-report conversation flow using an explicit state machine.

State stored in context.user_data:
  - "incident_data"  : dict  — collected field values
  - "field_index"    : int   — index into FIELDS list (current field to ask)
  - "awaiting_phone" : bool  — True while waiting for contact share
"""
import logging

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.ext import ContextTypes

from agent.incident_agent import IncidentAgent
from db.models import Incident
from db.session import SessionLocal

logger = logging.getLogger(__name__)

# ─── Field definitions ───────────────────────────────────────────────────────
# Fields are asked in order. "telefono" is obtained from the contact share and
# is NOT included here — it is injected into incident_data automatically.

FIELDS: list[dict] = [
    {
        "key": "nombre",
        "label": "nombre completo del reportante",
        "type": "text",
    },
    {
        "key": "nivel_organizacional",
        "label": "nivel organizacional",
        "type": "select",
        "options": ["Ejecutivo", "Supervisor", "Operador"],
    },
    {
        "key": "compania",
        "label": "compañía u organización",
        "type": "text",
    },
    {
        "key": "fecha_evento",
        "label": "fecha del evento (dd/mm/aaaa)",
        "type": "text",
    },
    {
        "key": "hora_aproximada",
        "label": "hora aproximada del evento",
        "type": "text",
    },
    {
        "key": "que_ocurrio",
        "label": "descripción de lo que ocurrió",
        "type": "text",
    },
    {
        "key": "por_que_ocurrio",
        "label": "posible causa del incidente",
        "type": "text",
    },
    {
        "key": "impacto",
        "label": "impacto generado (personas, equipos, ambiente, etc.)",
        "type": "text",
    },
    {
        "key": "clasificacion_principal",
        "label": "clasificación principal del incidente",
        "type": "select",
        "options": ["Seguridad", "Salud", "Medio ambiente"],
    },
]

# ─── Helpers ─────────────────────────────────────────────────────────────────


def _session_id(user_id: int) -> str:
    return f"incident_{user_id}"


def _current_field(context: ContextTypes.DEFAULT_TYPE) -> dict | None:
    idx = context.user_data.get("field_index", 0)
    return FIELDS[idx] if idx < len(FIELDS) else None


def _advance_field(context: ContextTypes.DEFAULT_TYPE) -> None:
    context.user_data["field_index"] = context.user_data.get("field_index", 0) + 1


def _select_keyboard(options: list[str]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton(opt, callback_data=f"select:{opt}")] for opt in options]
    )


# ─── Core flow ───────────────────────────────────────────────────────────────


async def _ask_current_field(
    chat_id: int,
    user_id: int,
    context: ContextTypes.DEFAULT_TYPE,
) -> None:
    """Send the question for the field we are currently collecting."""
    logger.error(f"Asking current field: {_current_field(context)}")
    field = _current_field(context)
    if field is None:
        await _complete_report(chat_id, user_id, context)
        return

    
    logger.error(f"Incident data: {context.user_data.get('incident_data', {})}")
    logger.error(f"Session ID: {_session_id(user_id)}")
    incident_data = context.user_data.get("incident_data", {})
    agent = IncidentAgent(_session_id(user_id))
    question = await agent.generate_question(field["label"], incident_data)

    if field["type"] == "select":
        keyboard = _select_keyboard(field["options"])
        await context.bot.send_message(
            chat_id=chat_id, text=question, reply_markup=keyboard
        )
    else:
        await context.bot.send_message(chat_id=chat_id, text=question)


async def _process_text_response(
    chat_id: int,
    user_id: int,
    context: ContextTypes.DEFAULT_TYPE,
    user_input: str,
) -> None:
    """Validate and store a free-text answer, then move to the next field."""
    field = _current_field(context)
    if field is None:
        return

    if field["type"] == "select":
        # User typed instead of tapping a button — remind them to use the keyboard
        await context.bot.send_message(
            chat_id=chat_id,
            text="Por favor, selecciona una de las opciones del menú.",
        )
        return

    agent = IncidentAgent(_session_id(user_id))
    
    result = await agent.extract_value(field["label"], user_input)

    if result.get("valid"):
        incident_data = context.user_data.get("incident_data", {})
        incident_data[field["key"]] = result["value"]
        context.user_data["incident_data"] = incident_data
        _advance_field(context)
        await _ask_current_field(chat_id, user_id, context)
    else:
        error = result.get("error", "No pude entender tu respuesta.")
        await context.bot.send_message(
            chat_id=chat_id,
            text=f"No pude registrar ese dato. {error}\nPor favor, intenta de nuevo.",
        )


async def _process_select_response(
    chat_id: int,
    user_id: int,
    context: ContextTypes.DEFAULT_TYPE,
    value: str,
) -> None:
    """Store an inline-keyboard selection and advance to the next field."""
    field = _current_field(context)
    if field is None:
        return

    incident_data = context.user_data.get("incident_data", {})
    incident_data[field["key"]] = value
    context.user_data["incident_data"] = incident_data

    # Persist the selection in conversation history via the agent
    agent = IncidentAgent(_session_id(user_id))
    agent.history.add_user_message(f"{field['label']}: {value}")

    _advance_field(context)
    await _ask_current_field(chat_id, user_id, context)


async def _complete_report(
    chat_id: int,
    user_id: int,
    context: ContextTypes.DEFAULT_TYPE,
) -> None:
    """Generate a summary, save to DB, and thank the user."""
    incident_data = context.user_data.get("incident_data", {})
    session_id = _session_id(user_id)

    # Generate summary via LLM
    agent = IncidentAgent(session_id)
    summary = await agent.generate_summary(incident_data)
    await context.bot.send_message(chat_id=chat_id, text=summary)

    # Persist to PostgreSQL
    db = SessionLocal()
    try:
        incident = Incident(
            telegram_user_id=user_id,
            session_id=session_id,
            nombre=incident_data.get("nombre"),
            telefono=incident_data.get("telefono"),
            nivel_organizacional=incident_data.get("nivel_organizacional"),
            compania=incident_data.get("compania"),
            fecha_evento=incident_data.get("fecha_evento"),
            hora_aproximada=incident_data.get("hora_aproximada"),
            que_ocurrio=incident_data.get("que_ocurrio"),
            por_que_ocurrio=incident_data.get("por_que_ocurrio"),
            impacto=incident_data.get("impacto"),
            clasificacion_principal=incident_data.get("clasificacion_principal"),
        )
        db.add(incident)
        db.commit()
        logger.info("Incident saved — user_id=%s session=%s", user_id, session_id)
    except Exception:
        logger.exception("Failed to save incident for user %s", user_id)
        db.rollback()
    finally:
        db.close()

    await context.bot.send_message(
        chat_id=chat_id,
        text=(
            "✅ *¡Reporte completado con éxito!*\n\n"
            "Gracias por tomarte el tiempo de registrar este incidente. "
            "Tu reporte ha sido guardado y será gestionado por el equipo correspondiente.\n\n"
            "Si necesitas registrar otro incidente, usa el comando /start."
        ),
        parse_mode="Markdown",
    )

    # Clear in-memory state
    context.user_data.clear()


# ─── Telegram handler functions ──────────────────────────────────────────────


async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start — reset state and ask for phone number."""
    user = update.effective_user
    context.user_data.clear()
    context.user_data["incident_data"] = {}
    context.user_data["field_index"] = 0
    context.user_data["awaiting_phone"] = True

    keyboard = [
        [KeyboardButton("📱 Compartir mi número de teléfono", request_contact=True)]
    ]
    await update.message.reply_text(
        f"Hola {user.first_name}! 👋\n\n"
        "*Bienvenido al Sistema de Reporte de Incidentes.*\n\n"
        "Te guiaré paso a paso para registrar la información del evento. "
        "Para comenzar, por favor comparte tu número de teléfono:",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(
            keyboard, one_time_keyboard=True, resize_keyboard=True
        ),
    )


async def contact_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Receive the shared phone number, then start asking fields."""
    contact = update.message.contact
    incident_data = context.user_data.get("incident_data", {})
    incident_data["telefono"] = contact.phone_number
    context.user_data["incident_data"] = incident_data
    context.user_data["awaiting_phone"] = False

    await update.message.reply_text(
        f"✅ Teléfono registrado: {contact.phone_number}",
        reply_markup=ReplyKeyboardRemove(),
    )

    await _ask_current_field(
        update.effective_chat.id,
        update.effective_user.id,
        context,
    )


async def message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle free-text responses from the user."""
    logger.error(f"Message handler: {update.message.text}")
    if not update.message or not update.message.text:
        return

    if context.user_data.get("awaiting_phone"):
        await update.message.reply_text(
            "Por favor, usa el botón para compartir tu número de teléfono. 📱"
        )
        return

    if not context.user_data.get("incident_data"):
        await update.message.reply_text(
            "Por favor, inicia el reporte con el comando /start."
        )
        return
    logger.error(f"Processing text response: {update.message.text}")
    logger.error(f"User ID: {update.effective_user.id}")
    logger.error(f"Chat ID: {update.effective_chat.id}")
    logger.error(f"Context: {context}")
    await _process_text_response(
        update.effective_chat.id,
        update.effective_user.id,
        context,
        update.message.text,
    )


async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle inline keyboard (selectable options) callbacks."""
    query = update.callback_query
    await query.answer()

    if not query.data.startswith("select:"):
        return

    value = query.data.split(":", 1)[1]
    await query.edit_message_text(f"✅ Seleccionado: *{value}*", parse_mode="Markdown")

    await _process_select_response(
        update.effective_chat.id,
        update.effective_user.id,
        context,
        value,
    )
