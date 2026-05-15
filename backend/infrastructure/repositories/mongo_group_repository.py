from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.group import GroupEntity, GroupMemberEntity
from backend.domain.interfaces.group_repository import IGroupRepository

_GROUPS_LIMIT = 100


class MongoGroupRepository(IGroupRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["groups"]

    def _to_entity(self, doc: dict) -> GroupEntity:
        data = dict(doc)
        data["id"] = str(data.pop("_id"))
        members = [GroupMemberEntity(**m) for m in data.get("members", [])]
        data["members"] = members
        return GroupEntity(**data)

    async def create(self, group: GroupEntity) -> GroupEntity:
        now = datetime.now(timezone.utc)
        data = group.model_dump(exclude={"id"})
        data["members"] = [m.model_dump() for m in group.members]
        data["created_at"] = now
        data["updated_at"] = now
        result = await self._col.insert_one(data)
        group.id = str(result.inserted_id)
        return group

    async def find_by_id(self, group_id: str) -> Optional[GroupEntity]:
        try:
            doc = await self._col.find_one({"_id": ObjectId(group_id)})
        except Exception:
            return None
        return self._to_entity(doc) if doc else None

    async def find_by_member(self, user_id: str) -> list[GroupEntity]:
        docs = await self._col.find(
            {"members.user_id": user_id, "is_active": True}
        ).to_list(_GROUPS_LIMIT)
        return [self._to_entity(d) for d in docs]

    async def add_member(self, group_id: str, member: GroupMemberEntity) -> None:
        await self._col.update_one(
            {"_id": ObjectId(group_id)},
            {
                "$push": {"members": member.model_dump()},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

    async def remove_member(self, group_id: str, user_id: str) -> None:
        await self._col.update_one(
            {"_id": ObjectId(group_id)},
            {
                "$pull": {"members": {"user_id": user_id}},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

    async def soft_delete(self, group_id: str) -> None:
        await self._col.update_one(
            {"_id": ObjectId(group_id)},
            {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}},
        )

    async def is_member(self, group_id: str, user_id: str) -> bool:
        try:
            doc = await self._col.find_one(
                {"_id": ObjectId(group_id), "members.user_id": user_id},
                {"_id": 1},
            )
        except Exception:
            return False
        return doc is not None

    async def get_member_role(self, group_id: str, user_id: str) -> Optional[str]:
        try:
            doc = await self._col.find_one(
                {"_id": ObjectId(group_id)},
                {"members": 1},
            )
        except Exception:
            return None
        if not doc:
            return None
        for m in doc.get("members", []):
            if m["user_id"] == user_id:
                return m["role"]
        return None
