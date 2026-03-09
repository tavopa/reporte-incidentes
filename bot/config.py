from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    telegram_bot_token: str
    database_url: str
    litemaas_url: str
    litellm_master_key: str
    openai_model: str = "gpt-4o-mini"
    log_level: str = "INFO"


settings = Settings()
