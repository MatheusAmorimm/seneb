import secrets
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.mail import send_verification_code as send_email
from backend.core.security import hash_otp

_OTP_MIN = 10_000_000
_OTP_RANGE = 90_000_000


class SendVerificationCodeUseCase:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._db = db

    async def execute(self, email: str) -> None:
        code = str(secrets.randbelow(_OTP_RANGE) + _OTP_MIN)

        await self._db.verification_codes.update_one(
            {"email": email},
            {
                "$set": {
                    "code_hash": hash_otp(code),
                    "email": email,
                    "created_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

        await send_email(email, code)
