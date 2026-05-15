from datetime import datetime, timezone

from backend.application.dtos.group_dtos import CreateGroupInput
from backend.domain.entities.group import GroupEntity, GroupMemberEntity
from backend.domain.interfaces.group_repository import IGroupRepository


class CreateGroupUseCase:
    def __init__(self, group_repo: IGroupRepository) -> None:
        self._group_repo = group_repo

    async def execute(
        self,
        data: CreateGroupInput,
        current_user_id: str,
    ) -> GroupEntity:
        group = GroupEntity(
            name=data.name,
            owner_id=current_user_id,
            members=[
                GroupMemberEntity(
                    user_id=current_user_id,
                    role="admin",
                    joined_at=datetime.now(timezone.utc),
                )
            ],
        )
        return await self._group_repo.create(group)
