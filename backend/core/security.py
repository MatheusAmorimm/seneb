import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Union

import bcrypt
from jose import jwt

from backend.core.configs import settings

# bcrypt só considera os primeiros 72 bytes da senha. O passlib (usado antes)
# truncava silenciosamente; mantemos o mesmo comportamento para que hashes
# antigos continuem válidos.
_BCRYPT_MAX_BYTES = 72
_BCRYPT_ROUNDS = 12


def _prepare_password(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)
    return bcrypt.hashpw(_prepare_password(password), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare_password(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        # hash malformado ou de outro algoritmo
        return False


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
