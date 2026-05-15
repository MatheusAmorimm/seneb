from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.auth_dtos import ResetPasswordInput
from backend.application.gate import Gate
from backend.core.exceptions import DomainException
from backend.core.security import get_password_hash, verify_otp
from backend.domain.interfaces.user_repository import IUserRepository


class ResetPasswordUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, data: ResetPasswordInput) -> None:
        Gate().require(
            data.new_password == data.confirm_password,
            "Senhas não conferem.",
        ).check()

        stored = await self._db.password_reset_codes.find_one({"email": data.email})

        Gate().require(
            stored is not None,
            "Nenhum código solicitado para este e-mail.",
        ).require(
            stored is not None
            and verify_otp(data.code, stored["code_hash"]),
            "Código de verificação inválido.",
        ).check()

        user = await self._user_repo.find_by_email(data.email)
        if not user:
            raise DomainException("Usuário não encontrado.")

        hashed = get_password_hash(data.new_password)
        await self._user_repo.update_password(str(user.id), hashed)

        await self._db.password_reset_codes.delete_one({"email": data.email})
        await self._db.refresh_tokens.delete_many({"user_id": str(user.id)})
