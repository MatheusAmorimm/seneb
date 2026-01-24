from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Finance Control SaaS"

    # Variáveis Obrigatórias (Se não tiver no .env, o app não liga)
    MONGO_URI: str = ""
    SECRET_KEY: str = ""

    DATABASE_NAME: str = "finance_saas_dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Configuração da Classe (A mágica acontece aqui)
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", case_sensitive=True
    )


@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()