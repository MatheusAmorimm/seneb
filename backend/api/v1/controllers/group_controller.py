from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.v1.dependencies import (
    get_current_user,
    get_group_repo,
    get_notification_repo,
    get_user_repo,
)
from backend.application.dtos.group_dtos import CreateGroupInput, GroupOutput, InviteMemberInput
from backend.application.use_cases.group.create_group import CreateGroupUseCase
from backend.application.use_cases.group.delete_group import DeleteGroupUseCase
from backend.application.use_cases.group.invite_member import InviteMemberUseCase
from backend.application.use_cases.group.leave_group import LeaveGroupUseCase
from backend.application.use_cases.group.list_groups import ListGroupsUseCase
from backend.core.exceptions import (
    ConflictException,
    DomainException,
    ForbiddenException,
    NotFoundException,
)
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.notification_repository import INotificationRepository
from backend.domain.interfaces.user_repository import IUserRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    if isinstance(exc, ForbiddenException):
        raise HTTPException(status_code=403, detail=exc.message)
    if isinstance(exc, ConflictException):
        raise HTTPException(status_code=409, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.post("", response_model=GroupOutput)
async def create_group(
    data: CreateGroupInput,
    current_user: UserEntity = Depends(get_current_user),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    entity = await CreateGroupUseCase(group_repo).execute(data, str(current_user.id))
    return GroupOutput(
        id=entity.id,
        name=entity.name,
        owner_id=entity.owner_id,
        members=[{"user_id": m.user_id, "role": m.role} for m in entity.members],
        created_at=entity.created_at,
    )


@router.get("", response_model=list[GroupOutput])
async def get_groups(
    current_user: UserEntity = Depends(get_current_user),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    entities = await ListGroupsUseCase(group_repo).execute(str(current_user.id))
    return [
        GroupOutput(
            id=e.id,
            name=e.name,
            owner_id=e.owner_id,
            members=[{"user_id": m.user_id, "role": m.role} for m in e.members],
            created_at=e.created_at,
        )
        for e in entities
    ]


@router.post("/{group_id}/members", status_code=status.HTTP_200_OK)
async def invite_member(
    group_id: str,
    data: InviteMemberInput,
    current_user: UserEntity = Depends(get_current_user),
    group_repo: IGroupRepository = Depends(get_group_repo),
    user_repo: IUserRepository = Depends(get_user_repo),
    notification_repo: INotificationRepository = Depends(get_notification_repo),
):
    try:
        result = await InviteMemberUseCase(group_repo, user_repo, notification_repo).execute(
            group_id, data, str(current_user.id)
        )
        if result == "not_registered":
            return {
                "message": f"Este e-mail não possui conta no Seneb. Um convite foi enviado para {data.email}.",
                "status": "email_sent",
            }
        return {"message": "Convite enviado com sucesso.", "status": "notified"}
    except DomainException as exc:
        _handle(exc)


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    current_user: UserEntity = Depends(get_current_user),
    group_repo: IGroupRepository = Depends(get_group_repo),
    notification_repo: INotificationRepository = Depends(get_notification_repo),
):
    try:
        await DeleteGroupUseCase(group_repo, notification_repo).execute(
            group_id, str(current_user.id)
        )
        return {"message": "Grupo excluído com sucesso."}
    except DomainException as exc:
        _handle(exc)


@router.post("/{group_id}/leave")
async def leave_group(
    group_id: str,
    current_user: UserEntity = Depends(get_current_user),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        await LeaveGroupUseCase(group_repo).execute(group_id, str(current_user.id))
        return {"message": "Você saiu do grupo com sucesso."}
    except DomainException as exc:
        _handle(exc)
