from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.user import UserEntity


class IUserRepository(ABC):
    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[UserEntity]: ...

    @abstractmethod
    async def find_by_id(self, user_id: str) -> Optional[UserEntity]: ...

    @abstractmethod
    async def create(self, user: UserEntity) -> UserEntity: ...

    @abstractmethod
    async def email_exists(self, email: str) -> bool: ...

    @abstractmethod
    async def update_password(self, user_id: str, hashed_password: str) -> bool: ...

    @abstractmethod
    async def invalidate_token(self, user_id: str) -> None: ...

    @abstractmethod
    async def update_email(self, user_id: str, new_email: str) -> bool: ...

    @abstractmethod
    async def update_profile(
        self,
        user_id: str,
        full_name: Optional[str],
        nickname: Optional[str],
    ) -> Optional[UserEntity]: ...

    @abstractmethod
    async def add_custom_bank(self, user_id: str, bank_name: str) -> bool: ...
