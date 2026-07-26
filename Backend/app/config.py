import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Description: System configuration settings loaded from environment variables.
    Usecase: Provides type-safe access to application-wide constants like API keys and DB URLs.
    """
    PROJECT_NAME: str = "Query-Sense-AI"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/querysense_db")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()