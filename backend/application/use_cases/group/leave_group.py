from backend.core.exceptions import DomainException, NotFoundException
from backend.domain.interfaces.group_repository import IGroupRepository


class LeaveGroupUseCase:
    def __init__(self, group_repo: IGroupRepository) -> None:
        self._group_repo = group_repo

    async def execute(self, group_id: str, current_user_id: str) -> None:
        group = await self._group_repo.find_by_id(group_id)

        if not group or not await self._group_repo.is_member(group_id, current_user_id):
            raise NotFoundException("Grupo não encontrado ou você não pertence a ele.")

        if group.owner_id == current_user_id:
            raise DomainException("Você é o criador. Exclua o grupo em vez de sair.")

        await self._group_repo.remove_member(group_id, current_user_id)
