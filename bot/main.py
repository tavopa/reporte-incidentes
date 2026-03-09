"""
main.py — Entry point for the Telegram Incident Report Bot.

Wires together:
  - python-telegram-bot v21 (async Application)
  - LangChain + OpenAI via LiteMaas (in incident_agent.py)
  - PostgreSQL memory + incident storage (db/)
"""
import logging

from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    MessageHandler,
    filters,
)

from config import settings
from db.session import init_db
from handlers.incident_handler import (
    callback_handler,
    contact_handler,
    message_handler,
    start_handler,
)

logging.basicConfig(
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
)
# Silence overly verbose libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("telegram").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


def main() -> None:
    # Ensure our application tables exist (incidents, etc.)
    init_db()
    logger.info("Database ready.")

    app = Application.builder().token(settings.telegram_bot_token).build()

    # ── Handlers (order matters for filters) ──────────────────────────────
    app.add_handler(CommandHandler("start", start_handler))

    # Contact share (phone number)
    app.add_handler(MessageHandler(filters.CONTACT, contact_handler))

    # Inline keyboard selections
    app.add_handler(CallbackQueryHandler(callback_handler))

    # Free-text messages
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, message_handler))

    logger.info("Bot started. Polling for updates…")
    app.run_polling(allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    main()
