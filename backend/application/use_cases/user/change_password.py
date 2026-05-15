import secrets
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.user_dtos import ChangePasswordConfirmInput, ChangePasswordInitInput
from backend.application.gate import Gate
from backend.core.exceptions import DomainException
from backend.core.mail import send_password_reset_code
from backend.core.security import get_password_hash, hash_otp, verify_otp, verify_password
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository

_OTP_MIN = 10_000_000
_OTP_RANGE = 90_000_000


class ChangePasswordInitUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(
        self,
        data: ChangePasswordInitInput,
        current_user: UserEntity,
    ) -> None:
        if not verify_password(data.current_password, current_user.password_hash):
            raise DomainException("Senha atual incorreta.")

        code = str(secrets.randbelow(_OTP_RANGE) + _OTP_MIN)

        await self._db.password_change_codes.update_one(
            {"user_id": str(current_user.id)},
            {
                "$set": {
                    "code_hash": hash_otp(code),
                    "user_id": str(current_user.id),
                    "created_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

        await send_password_reset_code(current_user.email, code)


class ChangePasswordConfirmUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(
        self,
        data: ChangePasswordConfirmInput,
        current_user: UserEntity,
    ) -> None:
        Gate().require(
            data.new_password == data.confirm_password,
            "Senhas não conferem.",
        ).check()

        stored = await self._db.password_change_codes.find_one(
            {"user_id": str(current_user.id)}
        )
        Gate().require(stored is not None, "Nenhum código solicitado.").require(
            stored is not None and verify_otp(data.code, stored["code_hash"]),
            "Código inválido.",
        ).check()

        hashed = get_password_hash(data.new_password)
        await self._user_repo.update_password(str(current_user.id), hashed)
        await self._db.password_change_codes.delete_one({"user_id": str(current_user.id)})
        await self._db.refresh_tokens.delete_many({"user_id": str(current_user.id)})
