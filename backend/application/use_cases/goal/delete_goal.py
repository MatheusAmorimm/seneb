from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.interfaces.goal_repository import IGoalRepository


class DeleteGoalUseCase:
    def __init__(self, goal_repo: IGoalRepository) -> None:
        self._goal_repo = goal_repo

    async def execute(self, goal_id: str, user_id: str) -> None:
        goal = await self._goal_repo.find_by_id(goal_id)
        if not goal:
            raise NotFoundException("Meta não encontrada.")
        if goal.user_id != user_id:
            raise ForbiddenException("Acesso negado.")
        await self._goal_repo.delete(goal_id)
