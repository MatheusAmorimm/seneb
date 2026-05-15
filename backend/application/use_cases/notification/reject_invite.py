from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.interfaces.notification_repository import INotificationRepository


class RejectInviteUseCase:
    def __init__(self, notification_repo: INotificationRepository) -> None:
        self._notification_repo = notification_repo

    async def execute(self, notification_id: str, current_user_id: str) -> None:
        notification = await self._notification_repo.find_by_id(notification_id)
        if not notification:
            raise NotFoundException("Convite não encontrado.")

        if notification.user_id != current_user_id:
            raise ForbiddenException("Você não tem permissão para recusar este convite.")

        await self._notification_repo.mark_as_read(notification_id, current_user_id)
