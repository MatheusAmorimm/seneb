from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase


class GetGoalMonthlyTotalUseCase:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._db = db

    async def execute(self, user_id: str) -> float:
        now = datetime.now()
        month_prefix = now.strftime("%Y-%m")  # "2026-05"

        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "type": "goal",
                    "date": {"$regex": f"^{month_prefix}"},
                }
            },
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        agg = await self._db["transactions"].aggregate(pipeline).to_list(1)
        return agg[0]["total"] if agg else 0.0
