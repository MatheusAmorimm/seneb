from backend.application.dtos.group_dtos import InviteMemberInput
from backend.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from backend.core.mail import send_group_invite_email
from backend.domain.entities.notification import NotificationEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.notification_repository import INotificationRepository
from backend.domain.interfaces.user_repository import IUserRepository

_NOT_REGISTERED = "not_registered"


class InviteMemberUseCase:
    def __init__(
        self,
        group_repo: IGroupRepository,
        user_repo: IUserRepository,
        notification_repo: INotificationRepository,
    ) -> None:
        self._group_repo = group_repo
        self._user_repo = user_repo
        self._notification_repo = notification_repo

    async def execute(
        self,
        group_id: str,
        data: InviteMemberInput,
        current_user_id: str,
    ) -> str:
        group = await self._group_repo.find_by_id(group_id)
        if not group:
            raise NotFoundException("Grupo não encontrado.")

        role = await self._group_repo.get_member_role(group_id, current_user_id)
        if role != "admin":
            raise ForbiddenException("Apenas administradores podem convidar membros.")

        invited = await self._user_repo.find_by_email(data.email)

        if not invited:
            inviting_user = await self._user_repo.find_by_id(current_user_id)
            inviter_name = (
                inviting_user.nickname
                or inviting_user.full_name.split()[0]
                if inviting_user
                else "Um usuário do Seneb"
            )
            await send_group_invite_email(data.email, inviter_name, group.name)
            return _NOT_REGISTERED

        if await self._group_repo.is_member(group_id, str(invited.id)):
            raise ConflictException("Usuário já está no grupo.")

        notification = NotificationEntity(
            user_id=str(invited.id),
            title="Novo Convite de Grupo",
            message=f"Você foi convidado para participar do grupo '{group.name}'.",
            type="group_invite",
            read=False,
            meta_data={"group_id": group_id, "role": data.role},
        )
        await self._notification_repo.create(notification)
        return "ok"
