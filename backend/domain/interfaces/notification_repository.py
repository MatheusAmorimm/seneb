from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.notification import NotificationEntity

MAX_NOTIFICATIONS = 50


class INotificationRepository(ABC):
    @abstractmethod
    async def create(self, notification: NotificationEntity) -> NotificationEntity: ...

    @abstractmethod
    async def find_by_user(
        self,
        user_id: str,
        limit: int = MAX_NOTIFICATIONS,
    ) -> list[NotificationEntity]: ...

    @abstractmethod
    async def find_by_id(
        self,
        notification_id: str,
    ) -> Optional[NotificationEntity]: ...

    @abstractmethod
    async def mark_as_read(
        self,
        notification_id: str,
        user_id: str,
    ) -> bool: ...

    @abstractmethod
    async def delete_pending_invites(self, group_id: str) -> None: ...
