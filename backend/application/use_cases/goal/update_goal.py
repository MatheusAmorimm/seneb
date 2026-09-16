from backend.application.dtos.goal_dtos import GoalOutput, GoalUpdateInput
from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.interfaces.goal_repository import IGoalRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class UpdateGoalUseCase:
    def __init__(
        self,
        goal_repo: IGoalRepository,
        transaction_repo: ITransactionRepository,
    ) -> None:
        self._goal_repo = goal_repo
        self._transaction_repo = transaction_repo

    async def execute(self, goal_id: str, data: GoalUpdateInput, user_id: str) -> GoalOutput:
        goal = await self._goal_repo.find_by_id(goal_id)
        if not goal:
            raise NotFoundException("Meta não encontrada.")
        if goal.user_id != user_id:
            raise ForbiddenException("Acesso negado.")

        updates = data.model_dump(exclude_none=True)
        updated = await self._goal_repo.update(goal_id, updates)
        if not updated:
            raise NotFoundException("Meta não encontrada.")

        current_amount = await self._transaction_repo.sum_goal_contribution(goal_id)

        return GoalOutput(
            id=updated.id,
            user_id=updated.user_id,
            name=updated.name,
            target_amount=updated.target_amount,
            deadline=updated.deadline,
            image_base64=updated.image_base64,
            current_amount=current_amount,
            is_celebrated=updated.is_celebrated,
            celebrated_at=updated.celebrated_at,
            created_at=updated.created_at,
        )
