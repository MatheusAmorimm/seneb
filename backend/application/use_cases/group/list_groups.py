from backend.domain.entities.group import GroupEntity
from backend.domain.interfaces.group_repository import IGroupRepository


class ListGroupsUseCase:
    def __init__(self, group_repo: IGroupRepository) -> None:
        self._group_repo = group_repo

    async def execute(self, current_user_id: str) -> list[GroupEntity]:
        return await self._group_repo.find_by_member(current_user_id)
