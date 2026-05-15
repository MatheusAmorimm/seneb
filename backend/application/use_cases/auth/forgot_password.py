import secrets
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.mail import send_password_reset_code
from backend.core.security import hash_otp
from backend.domain.interfaces.user_repository import IUserRepository

_OTP_MIN = 10_000_000
_OTP_RANGE = 90_000_000


class ForgotPasswordUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, email: str) -> None:
        user = await self._user_repo.find_by_email(email)

        if not user:
            return

        code = str(secrets.randbelow(_OTP_RANGE) + _OTP_MIN)

        await self._db.password_reset_codes.update_one(
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

        await send_password_reset_code(email, code)
