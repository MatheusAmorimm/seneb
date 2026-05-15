from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.notification_repository import INotificationRepository


class DeleteGroupUseCase:
    def __init__(
        self,
        group_repo: IGroupRepository,
        notification_repo: INotificationRepository,
    ) -> None:
        self._group_repo = group_repo
        self._notification_repo = notification_repo

    async def execute(self, group_id: str, current_user_id: str) -> None:
        group = await self._group_repo.find_by_id(group_id)
        if not group:
            raise NotFoundException("Grupo não encontrado.")

        if group.owner_id != current_user_id:
            raise ForbiddenException("Apenas o criador pode excluir o grupo.")

        await self._group_repo.soft_delete(group_id)
        await self._notification_repo.delete_pending_invites(group_id)
