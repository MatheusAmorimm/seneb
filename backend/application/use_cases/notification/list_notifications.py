from backend.domain.entities.notification import NotificationEntity
from backend.domain.interfaces.notification_repository import INotificationRepository


class ListNotificationsUseCase:
    def __init__(self, notification_repo: INotificationRepository) -> None:
        self._notification_repo = notification_repo

    async def execute(self, current_user_id: str) -> list[NotificationEntity]:
        return await self._notification_repo.find_by_user(current_user_id)
