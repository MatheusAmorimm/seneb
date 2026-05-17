from backend.application.dtos.goal_dtos import GoalOutput, GoalUpdateInput
from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.interfaces.goal_repository import IGoalRepository
from motor.motor_asyncio import AsyncIOMotorDatabase


class UpdateGoalUseCase:
    def __init__(self, goal_repo: IGoalRepository, db: AsyncIOMotorDatabase) -> None:
        self._goal_repo = goal_repo
        self._db = db

    async def execute(self, goal_id: str, data: GoalUpdateInput, user_id: str) -> GoalOutput:
        goal = await self._goal_repo.find_by_id(goal_id)
        if not goal:
            raise NotFoundException("Meta não encontrada.")
        if goal.user_id != user_id:
            raise ForbiddenException("Acesso negado.")

        updates = data.model_dump(exclude_none=True)
        updated = await self._goal_repo.update(goal_id, updates)

        pipeline = [
            {"$match": {"user_id": user_id, "type": "goal", "goal_id": goal_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        agg = await self._db["transactions"].aggregate(pipeline).to_list(1)
        current_amount = agg[0]["total"] if agg else 0.0

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
