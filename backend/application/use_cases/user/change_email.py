import secrets
from datetime import datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.user_dtos import (
    ChangeEmailInitInput,
    SetNewEmailInput,
    VerifyCodeInput,
)
from backend.application.gate import Gate
from backend.core.exceptions import ConflictException, DomainException
from backend.core.mail import send_email_change_code, send_email_confirmation_code
from backend.core.security import hash_otp, verify_otp, verify_password
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository

_EMAIL_CHANGE_COOLDOWN_DAYS = 15
_OTP_MIN = 10_000_000
_OTP_RANGE = 90_000_000


class ChangeEmailInitUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(
        self,
        data: ChangeEmailInitInput,
        current_user: UserEntity,
    ) -> None:
        if not verify_password(data.current_password, current_user.password_hash):
            raise DomainException("Senha atual incorreta.")

        if current_user.last_email_change:
            days_since = (datetime.now(timezone.utc) - current_user.last_email_change).days
            if days_since < _EMAIL_CHANGE_COOLDOWN_DAYS:
                remaining = _EMAIL_CHANGE_COOLDOWN_DAYS - days_since
                raise DomainException(
                    f"Você só pode alterar o e-mail a cada {_EMAIL_CHANGE_COOLDOWN_DAYS} dias. "
                    f"Restam {remaining} dia(s)."
                )

        code = str(secrets.randbelow(_OTP_RANGE) + _OTP_MIN)

        await self._db.email_change_codes.update_one(
            {"user_id": str(current_user.id)},
            {
                "$set": {
                    "code_hash": hash_otp(code),
                    "user_id": str(current_user.id),
                    "step": "verify_current",
                    "created_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

        await send_email_change_code(current_user.email, code)


class ChangeEmailVerifyCurrentUseCase:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._db = db

    async def execute(self, data: VerifyCodeInput, current_user: UserEntity) -> None:
        stored = await self._db.email_change_codes.find_one(
            {"user_id": str(current_user.id), "step": "verify_current"}
        )
        Gate().require(stored is not None, "Nenhum código solicitado.").require(
            stored is not None and verify_otp(data.code, stored["code_hash"]),
            "Código inválido.",
        ).check()

        await self._db.email_change_codes.update_one(
            {"user_id": str(current_user.id)},
            {"$set": {"step": "set_new"}},
        )


class ChangeEmailSetNewUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, data: SetNewEmailInput, current_user: UserEntity) -> None:
        stored = await self._db.email_change_codes.find_one(
            {"user_id": str(current_user.id), "step": "set_new"}
        )
        if not stored:
            raise DomainException("Fluxo inválido. Reinicie o processo.")

        if await self._user_repo.email_exists(data.new_email):
            raise ConflictException("Este e-mail já está em uso por outra conta.")

        code = str(secrets.randbelow(_OTP_RANGE) + _OTP_MIN)

        await self._db.email_change_codes.update_one(
            {"user_id": str(current_user.id)},
            {
                "$set": {
                    "code_hash": hash_otp(code),
                    "new_email": data.new_email,
                    "step": "confirm_new",
                    "created_at": datetime.now(timezone.utc),
                }
            },
        )

        await send_email_confirmation_code(data.new_email, code)


class ChangeEmailConfirmUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, data: VerifyCodeInput, current_user: UserEntity) -> str:
        stored = await self._db.email_change_codes.find_one(
            {"user_id": str(current_user.id), "step": "confirm_new"}
        )
        Gate().require(stored is not None, "Fluxo inválido. Reinicie o processo.").require(
            stored is not None and verify_otp(data.code, stored["code_hash"]),
            "Código inválido.",
        ).check()

        new_email = stored["new_email"]
        await self._user_repo.update_email(str(current_user.id), new_email)
        await self._db.email_change_codes.delete_one({"user_id": str(current_user.id)})
        await self._db.refresh_tokens.delete_many({"user_id": str(current_user.id)})

        return new_email
