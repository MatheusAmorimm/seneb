from backend.application.dtos.goal_dtos import GoalInput, GoalOutput
from backend.domain.entities.goal import GoalEntity
from backend.domain.interfaces.goal_repository import IGoalRepository


class CreateGoalUseCase:
    def __init__(self, goal_repo: IGoalRepository) -> None:
        self._goal_repo = goal_repo

    async def execute(self, data: GoalInput, user_id: str) -> GoalOutput:
        entity = GoalEntity(
            user_id=user_id,
            name=data.name,
            target_amount=data.target_amount,
            deadline=data.deadline,
            image_base64=data.image_base64,
        )
        created = await self._goal_repo.create(entity)
        return GoalOutput(
            id=created.id,
            user_id=created.user_id,
            name=created.name,
            target_amount=created.target_amount,
            deadline=created.deadline,
            image_base64=created.image_base64,
            current_amount=0.0,
            is_celebrated=False,
            created_at=created.created_at,
        )
