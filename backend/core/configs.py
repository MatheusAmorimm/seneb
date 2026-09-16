from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Seneb - Finance Control"

    MONGO_URI: str = ""
    SECRET_KEY: str = ""
    DATABASE_NAME: str = "finance_saas_dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    DISABLE_OPENAPI: bool = False

    # E-mail transacional (qualquer provedor SMTP: Resend, Brevo, Gmail...)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    # Em desenvolvimento, registra o código no log em vez de enviar e-mail.
    # Também é o comportamento quando MAIL_SERVER não está configurado.
    MAIL_DEV_LOG_CODES: bool = False

    model_config = SettingsConfigDict(
        env_file=("backend/.env.dev", "backend/.env", ".env"),
        extra="ignore",
        case_sensitive=True,
    )

    @model_validator(mode="after")
    def validate_required(self) -> "Settings":
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set in environment variables.")
        if len(self.SECRET_KEY) < _MIN_SECRET_KEY_LENGTH:
            raise ValueError(
                f"SECRET_KEY must be at least {_MIN_SECRET_KEY_LENGTH} characters long."
            )
        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
