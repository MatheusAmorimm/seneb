from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.group import GroupEntity, GroupMemberEntity


class IGroupRepository(ABC):
    @abstractmethod
    async def create(self, group: GroupEntity) -> GroupEntity: ...

    @abstractmethod
    async def find_by_id(self, group_id: str) -> Optional[GroupEntity]: ...

    @abstractmethod
    async def find_by_member(self, user_id: str) -> list[GroupEntity]: ...

    @abstractmethod
    async def add_member(self, group_id: str, member: GroupMemberEntity) -> None: ...

    @abstractmethod
    async def remove_member(self, group_id: str, user_id: str) -> None: ...

    @abstractmethod
    async def soft_delete(self, group_id: str) -> None: ...

    @abstractmethod
    async def is_member(self, group_id: str, user_id: str) -> bool: ...

    @abstractmethod
    async def get_member_role(self, group_id: str, user_id: str) -> Optional[str]: ...
