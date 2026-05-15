from datetime import datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.auth_dtos import LoginOutput
from backend.core.configs import settings
from backend.core.exceptions import UnauthorizedException
from backend.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    verify_password,
)
from backend.domain.interfaces.user_repository import IUserRepository


class LoginUseCase:
    def __init__(self, user_repo: IUserRepository, db: AsyncIOMotorDatabase) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, email: str, password: str) -> LoginOutput:
        user = await self._user_repo.find_by_email(email)

        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("E-mail ou senha incorretos.")

        access_token = create_access_token(
            data={"sub": str(user.id), "ver": user.token_version},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        refresh_token = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self._db["refresh_tokens"].insert_one({
            "user_id": str(user.id),
            "token_hash": hash_refresh_token(refresh_token),
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
        })

        return LoginOutput(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_name=user.full_name,
            nickname=user.nickname,
        )
