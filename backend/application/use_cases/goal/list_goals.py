from backend.application.dtos.goal_dtos import GoalOutput
from backend.domain.interfaces.goal_repository import IGoalRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class ListGoalsUseCase:
    def __init__(
        self,
        goal_repo: IGoalRepository,
        transaction_repo: ITransactionRepository,
    ) -> None:
        self._goal_repo = goal_repo
        self._transaction_repo = transaction_repo

    async def execute(self, user_id: str) -> list[GoalOutput]:
        goals = await self._goal_repo.find_by_user(user_id)
        # Uma única agregação para todas as metas (antes era uma por meta).
        totals = await self._transaction_repo.sum_goal_contributions(user_id)

        return [
            GoalOutput(
                id=goal.id,
                user_id=goal.user_id,
                name=goal.name,
                target_amount=goal.target_amount,
                deadline=goal.deadline,
                image_base64=goal.image_base64,
                current_amount=totals.get(goal.id, 0.0),
                is_celebrated=goal.is_celebrated,
                celebrated_at=goal.celebrated_at,
                created_at=goal.created_at,
            )
            for goal in goals
        ]
