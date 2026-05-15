import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Union

from jose import jwt
from passlib.context import CryptContext

from backend.core.configs import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_otp(code: str) -> str:
    """Return an HMAC-SHA256 digest of the OTP keyed with SECRET_KEY.
    Prevents rainbow-table attacks on stored codes."""
    return hmac.new(
        settings.SECRET_KEY.encode(),
        code.encode(),
        hashlib.sha256,
    ).hexdigest()


def verify_otp(submitted: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_otp(submitted), stored_hash)


def generate_refresh_token() -> str:
    return secrets.token_hex(64)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(
    data: dict,
    expires_delta: Union[timedelta, None] = None,
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
