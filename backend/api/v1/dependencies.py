from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.configs import settings
from backend.core.database import db
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.analytics_repository import IAnalyticsRepository
from backend.domain.interfaces.goal_repository import IGoalRepository
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.notification_repository import INotificationRepository
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository
from backend.domain.interfaces.user_repository import IUserRepository
from backend.infrastructure.repositories.mongo_analytics_repository import (
    MongoAnalyticsRepository,
)
from backend.infrastructure.repositories.mongo_goal_repository import MongoGoalRepository
from backend.infrastructure.repositories.mongo_group_repository import MongoGroupRepository
from backend.infrastructure.repositories.mongo_notification_repository import (
    MongoNotificationRepository,
)
from backend.infrastructure.repositories.mongo_report_repository import MongoReportRepository
from backend.infrastructure.repositories.mongo_transaction_repository import (
    MongoTransactionRepository,
)
from backend.infrastructure.repositories.mongo_user_repository import MongoUserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenciais inválidas.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_db() -> AsyncIOMotorDatabase:
    return db.db


def get_user_repo(database: AsyncIOMotorDatabase = Depends(get_db)) -> IUserRepository:
    return MongoUserRepository(database)


def get_transaction_repo(
    database: AsyncIOMotorDatabase = Depends(get_db),
) -> ITransactionRepository:
    return MongoTransactionRepository(database)


def get_report_repo(
    database: AsyncIOMotorDatabase = Depends(get_db),
) -> IReportRepository:
    return MongoReportRepository(database)


def get_group_repo(
    database: AsyncIOMotorDatabase = Depends(get_db),
) -> IGroupRepository:
    return MongoGroupRepository(database)


def get_goal_repo(
    database: AsyncIOMotorDatabase = Depends(get_db),
) -> IGoalRepository:
    return MongoGoalRepository(database)


def get_notification_repo(
    database: AsyncIOMotorDatabase = Depends(get_db),
) -> INotificationRepository:
    return MongoNotificationRepository(database)


def get_analytics_repo(
    database: AsyncIOMotorDatabase = Depends(get_db),
) -> IAnalyticsRepository:
    return MongoAnalyticsRepository(database)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_repo: IUserRepository = Depends(get_user_repo),
) -> UserEntity:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id: str | None = payload.get("sub")
        token_version: int = payload.get("ver", 0)

        if user_id is None:
            raise _credentials_exception

    except JWTError:
        raise _credentials_exception

    user = await user_repo.find_by_id(user_id)

    if user is None:
        raise _credentials_exception

    if user.token_version != token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão encerrada. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
