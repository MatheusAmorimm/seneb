from datetime import datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.auth_dtos import SignupInput, SignupOutput
from backend.application.gate import Gate
from backend.core.configs import settings
from backend.core.exceptions import ConflictException
from backend.core.security import (
    create_access_token,
    generate_refresh_token,
    get_password_hash,
    hash_refresh_token,
    verify_otp,
)
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository


class SignupUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        db: AsyncIOMotorDatabase,
    ) -> None:
        self._user_repo = user_repo
        self._db = db

    async def execute(self, data: SignupInput) -> SignupOutput:
        Gate().require(
            data.password == data.confirm_password,
            "Senhas não conferem.",
        ).check()

        stored = await self._db.verification_codes.find_one({"email": data.email})

        Gate().require(
            stored is not None,
            "Nenhum código solicitado para este e-mail.",
        ).require(
            stored is not None
            and verify_otp(data.verification_code, stored["code_hash"]),
            "Código de verificação inválido.",
        ).check()

        if await self._user_repo.email_exists(data.email):
            raise ConflictException("E-mail já cadastrado.")

        user = UserEntity(
            email=data.email,
            password_hash=get_password_hash(data.password),
            full_name=data.full_name,
            nickname=data.nickname,
        )
        user = await self._user_repo.create(user)

        await self._db.verification_codes.delete_one({"email": data.email})

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

        return SignupOutput(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_name=user.full_name,
            user_nickname=user.nickname,
        )
