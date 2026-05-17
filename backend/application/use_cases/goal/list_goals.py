from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.application.dtos.goal_dtos import GoalOutput
from backend.domain.interfaces.goal_repository import IGoalRepository


class ListGoalsUseCase:
    def __init__(self, goal_repo: IGoalRepository, db: AsyncIOMotorDatabase) -> None:
        self._goal_repo = goal_repo
        self._db = db

    async def execute(self, user_id: str) -> list[GoalOutput]:
        goals = await self._goal_repo.find_by_user(user_id)
        result = []

        for goal in goals:
            pipeline = [
                {"$match": {"user_id": user_id, "type": "goal", "goal_id": goal.id}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
            ]
            agg = await self._db["transactions"].aggregate(pipeline).to_list(1)
            current_amount = agg[0]["total"] if agg else 0.0

            result.append(GoalOutput(
                id=goal.id,
                user_id=goal.user_id,
                name=goal.name,
                target_amount=goal.target_amount,
                deadline=goal.deadline,
                image_base64=goal.image_base64,
                current_amount=current_amount,
                is_celebrated=goal.is_celebrated,
                celebrated_at=goal.celebrated_at,
                created_at=goal.created_at,
            ))

        return result
