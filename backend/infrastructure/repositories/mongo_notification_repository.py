from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.notification import NotificationEntity
from backend.domain.interfaces.notification_repository import INotificationRepository

_MAX_NOTIFICATIONS = 50


class MongoNotificationRepository(INotificationRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["notifications"]

    def _to_entity(self, doc: dict) -> NotificationEntity:
        data = dict(doc)
        data["id"] = str(data.pop("_id"))
        data.setdefault("meta_data", {})
        return NotificationEntity(**data)

    async def create(self, notification: NotificationEntity) -> NotificationEntity:
        data = notification.model_dump(exclude={"id"})
        data["created_at"] = datetime.now(timezone.utc)
        result = await self._col.insert_one(data)
        notification.id = str(result.inserted_id)
        notification.created_at = data["created_at"]
        return notification

    async def find_by_user(
        self,
        user_id: str,
        limit: int = _MAX_NOTIFICATIONS,
    ) -> list[NotificationEntity]:
        docs = await (
            self._col.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(limit)
            .to_list(limit)
        )
        return [self._to_entity(d) for d in docs]

    async def find_by_id(self, notification_id: str) -> Optional[NotificationEntity]:
        try:
            obj_id = ObjectId(notification_id)
        except Exception:
            return None
        doc = await self._col.find_one({"_id": obj_id})
        return self._to_entity(doc) if doc else None

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        try:
            obj_id = ObjectId(notification_id)
        except Exception:
            return False
        result = await self._col.update_one(
            {"_id": obj_id, "user_id": user_id},
            {"$set": {"read": True}},
        )
        return result.modified_count > 0

    async def delete_pending_invites(self, group_id: str) -> None:
        await self._col.delete_many(
            {"type": "group_invite", "meta_data.group_id": group_id}
        )
