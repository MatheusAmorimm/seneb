from backend.core.exceptions import NotFoundException
from backend.domain.interfaces.notification_repository import INotificationRepository


class MarkNotificationAsReadUseCase:
    def __init__(self, notification_repo: INotificationRepository) -> None:
        self._notification_repo = notification_repo

    async def execute(self, notification_id: str, current_user_id: str) -> None:
        updated = await self._notification_repo.mark_as_read(
            notification_id=notification_id,
            user_id=current_user_id,
        )
        if not updated:
            raise NotFoundException("Notificação não encontrada.")
