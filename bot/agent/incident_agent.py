import json
import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_community.chat_message_histories import PostgresChatMessageHistory
from config import settings
from agent.prompts import (
    QUESTION_SYSTEM, QUESTION_HUMAN,
    EXTRACTION_SYSTEM, EXTRACTION_HUMAN,
    SUMMARY_SYSTEM, SUMMARY_HUMAN,
)

logger = logging.getLogger(__name__)


def _get_llm() -> ChatOpenAI:
    logger.info(f"Litemaas URL: {settings.litemaas_url}")
    logger.info(f"Litemaas Master Key: {settings.litellm_master_key}")
    logger.info(f"OpenAI Model: {settings.openai_model}")
    return ChatOpenAI(
        model=settings.openai_model,
        base_url=f"{settings.litemaas_url}/v1",
        api_key=settings.litellm_master_key,
        temperature=0.4,
    )


def _get_history(session_id: str) -> PostgresChatMessageHistory:
    """Return a LangChain message history backed by PostgreSQL."""
    return PostgresChatMessageHistory(
        connection_string=settings.database_url,
        session_id=session_id,
        table_name="message_store",
    )


class IncidentAgent:
    """
    Handles all LLM interactions for the incident report flow.

    Uses PostgresChatMessageHistory to persist the full conversation in the
    'message_store' table so the LLM has context on follow-up calls.
    """

    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.llm = _get_llm()
        self.history = _get_history(session_id)

    # ─── Public API ──────────────────────────────────────────────────────────

    async def generate_question(self, field_label: str, incident_data: dict) -> str:
        """Generate a natural, empathetic question for the given field."""
        collected = (
            json.dumps(incident_data, ensure_ascii=False, indent=2)
            if incident_data
            else "Ninguno aún."
        )
        messages = [
            SystemMessage(content=QUESTION_SYSTEM),
            *self._recent_history(4),
            HumanMessage(
                content=QUESTION_HUMAN.format(
                    field_label=field_label,
                    collected_data=collected,
                )
            ),
        ]
        logger.info(f"Messages: {messages}")
        logger.info(f"LLM: {self.llm}")
        
        response = await self.llm.ainvoke(messages)
        question_text = response.content

        # Persist the question in conversation history
        self.history.add_ai_message(question_text)
        return question_text

    async def extract_value(self, field_label: str, user_response: str) -> dict:
        """
        Extract and validate the field value from the user's free-text response.

        Returns {"value": str, "valid": bool, "error": str}.
        """
        # Persist the user message before calling the LLM
        self.history.add_user_message(user_response)

        messages = [
            SystemMessage(content=EXTRACTION_SYSTEM),
            HumanMessage(
                content=EXTRACTION_HUMAN.format(
                    field_label=field_label,
                    user_response=user_response,
                )
            ),
        ]
        response = await self.llm.ainvoke(messages)
        try:
            return json.loads(response.content)
        except (json.JSONDecodeError, ValueError):
            logger.warning("Could not parse extraction response: %s", response.content)
            # Treat the raw response as the value if JSON parsing fails
            return {"value": user_response, "valid": True, "error": ""}

    async def generate_summary(self, incident_data: dict) -> str:
        """Generate a human-readable summary of the completed incident report."""
        messages = [
            SystemMessage(content=SUMMARY_SYSTEM),
            HumanMessage(
                content=SUMMARY_HUMAN.format(
                    incident_data=json.dumps(incident_data, ensure_ascii=False, indent=2)
                )
            ),
        ]
        response = await self.llm.ainvoke(messages)
        return response.content

    # ─── Helpers ─────────────────────────────────────────────────────────────

    def _recent_history(self, n: int) -> list:
        """Return the last *n* messages from persistent history for context."""
        try:
            return self.history.messages[-n:]
        except Exception:
            return []
