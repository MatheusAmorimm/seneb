from datetime import datetime, timezone

from backend.core.exceptions import DomainException, ForbiddenException, NotFoundException
from backend.domain.entities.group import GroupMemberEntity
from backend.domain.entities.notification import NotificationEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.notification_repository import INotificationRepository


class AcceptInviteUseCase:
    def __init__(
        self,
        notification_repo: INotificationRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._notification_repo = notification_repo
        self._group_repo = group_repo

    async def execute(self, notification_id: str, current_user_id: str) -> None:
        notification = await self._notification_repo.find_by_id(notification_id)
        if not notification:
            raise NotFoundException("Convite não encontrado.")

        if notification.user_id != current_user_id:
            raise ForbiddenException("Você não tem permissão para aceitar este convite.")

        if notification.type != "group_invite":
            raise DomainException("Esta notificação não é um convite de grupo.")

        group_id = notification.meta_data.get("group_id")
        role = notification.meta_data.get("role", "guest")

        if not group_id:
            raise DomainException("Grupo inválido no convite.")

        group = await self._group_repo.find_by_id(group_id)
        if not group:
            raise NotFoundException("Grupo não encontrado.")

        already_member = await self._group_repo.is_member(group_id, current_user_id)
        if not already_member:
            member = GroupMemberEntity(
                user_id=current_user_id,
                role=role,
                joined_at=datetime.now(timezone.utc),
            )
            await self._group_repo.add_member(group_id, member)

            owner_notification = NotificationEntity(
                user_id=group.owner_id,
                title="Convite Aceito",
                message=f"Um usuário ingressou no grupo '{group.name}'.",
                type="info",
                read=False,
            )
            await self._notification_repo.create(owner_notification)

        await self._notification_repo.mark_as_read(notification_id, current_user_id)
