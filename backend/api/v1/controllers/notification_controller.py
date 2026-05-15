from fastapi import APIRouter, Depends, HTTPException

from backend.api.v1.dependencies import (
    get_current_user,
    get_group_repo,
    get_notification_repo,
)
from backend.application.dtos.notification_dtos import NotificationOutput
from backend.application.use_cases.notification.accept_invite import AcceptInviteUseCase
from backend.application.use_cases.notification.list_notifications import ListNotificationsUseCase
from backend.application.use_cases.notification.mark_as_read import MarkNotificationAsReadUseCase
from backend.application.use_cases.notification.reject_invite import RejectInviteUseCase
from backend.core.exceptions import DomainException, ForbiddenException, NotFoundException
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.notification_repository import INotificationRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    if isinstance(exc, ForbiddenException):
        raise HTTPException(status_code=403, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.get("", response_model=list[NotificationOutput])
async def get_notifications(
    current_user: UserEntity = Depends(get_current_user),
    notification_repo: INotificationRepository = Depends(get_notification_repo),
):
    entities = await ListNotificationsUseCase(notification_repo).execute(str(current_user.id))
    return [NotificationOutput(**e.model_dump()) for e in entities]


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: UserEntity = Depends(get_current_user),
    notification_repo: INotificationRepository = Depends(get_notification_repo),
):
    try:
        await MarkNotificationAsReadUseCase(notification_repo).execute(
            notification_id, str(current_user.id)
        )
        return {"message": "Notificação marcada como lida."}
    except DomainException as exc:
        _handle(exc)


@router.post("/{notification_id}/accept-invite")
async def accept_invite(
    notification_id: str,
    current_user: UserEntity = Depends(get_current_user),
    notification_repo: INotificationRepository = Depends(get_notification_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        await AcceptInviteUseCase(notification_repo, group_repo).execute(
            notification_id, str(current_user.id)
        )
        return {"message": "Convite aceito com sucesso!"}
    except DomainException as exc:
        _handle(exc)


@router.post("/{notification_id}/reject-invite")
async def reject_invite(
    notification_id: str,
    current_user: UserEntity = Depends(get_current_user),
    notification_repo: INotificationRepository = Depends(get_notification_repo),
):
    try:
        await RejectInviteUseCase(notification_repo).execute(
            notification_id, str(current_user.id)
        )
        return {"message": "Convite recusado."}
    except DomainException as exc:
        _handle(exc)
