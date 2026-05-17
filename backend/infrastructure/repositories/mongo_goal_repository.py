from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.goal import GoalEntity
from backend.domain.interfaces.goal_repository import IGoalRepository


class MongoGoalRepository(IGoalRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["goals"]

    def _to_entity(self, doc: dict) -> GoalEntity:
        data = dict(doc)
        data["id"] = str(data.pop("_id"))
        return GoalEntity(**data)

    async def create(self, goal: GoalEntity) -> GoalEntity:
        now = datetime.now(timezone.utc)
        data = goal.model_dump(exclude={"id", "current_amount"})
        data["created_at"] = now
        data["updated_at"] = now
        result = await self._col.insert_one(data)
        goal.id = str(result.inserted_id)
        goal.created_at = now
        return goal

    async def find_by_user(self, user_id: str) -> list[GoalEntity]:
        docs = await self._col.find({"user_id": user_id}).sort("created_at", -1).to_list(None)
        return [self._to_entity(d) for d in docs]

    async def find_by_id(self, goal_id: str) -> Optional[GoalEntity]:
        try:
            doc = await self._col.find_one({"_id": ObjectId(goal_id)})
        except Exception:
            return None
        return self._to_entity(doc) if doc else None

    async def update(self, goal_id: str, updates: dict) -> Optional[GoalEntity]:
        updates["updated_at"] = datetime.now(timezone.utc)
        try:
            await self._col.update_one({"_id": ObjectId(goal_id)}, {"$set": updates})
            doc = await self._col.find_one({"_id": ObjectId(goal_id)})
        except Exception:
            return None
        return self._to_entity(doc) if doc else None

    async def delete(self, goal_id: str) -> bool:
        try:
            result = await self._col.delete_one({"_id": ObjectId(goal_id)})
        except Exception:
            return False
        return result.deleted_count > 0
