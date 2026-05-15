from datetime import datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.auth_dtos import RefreshOutput
from backend.core.configs import settings
from backend.core.exceptions import UnauthorizedException
from backend.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
)
from backend.domain.interfaces.user_repository import IUserRepository


class RefreshTokenUseCase:
    def __init__(self, user_repo: IUserRepository, db: AsyncIOMotorDatabase) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, refresh_token: str) -> RefreshOutput:
        col = self._db["refresh_tokens"]
        token_hash = hash_refresh_token(refresh_token)

        stored = await col.find_one({"token_hash": token_hash})

        if not stored:
            raise UnauthorizedException("Sessão inválida. Faça login novamente.")

        if stored["expires_at"] < datetime.now(timezone.utc):
            await col.delete_one({"_id": stored["_id"]})
            raise UnauthorizedException("Sessão expirada. Faça login novamente.")

        user = await self._user_repo.find_by_id(stored["user_id"])
        if not user:
            await col.delete_one({"_id": stored["_id"]})
            raise UnauthorizedException("Usuário não encontrado.")

        # Rotate: delete old token and issue new one
        await col.delete_one({"_id": stored["_id"]})

        new_refresh_token = generate_refresh_token()
        new_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await col.insert_one({
            "user_id": str(user.id),
            "token_hash": hash_refresh_token(new_refresh_token),
            "expires_at": new_expires_at,
            "created_at": datetime.now(timezone.utc),
        })

        new_access_token = create_access_token(
            data={"sub": str(user.id), "ver": user.token_version},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return RefreshOutput(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        )
