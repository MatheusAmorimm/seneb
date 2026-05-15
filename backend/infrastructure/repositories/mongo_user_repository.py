from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository


class MongoUserRepository(IUserRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["users"]

    def _to_entity(self, doc: dict) -> UserEntity:
        data = dict(doc)
        data["id"] = str(data.pop("_id"))
        data.setdefault("token_version", 0)
        data.setdefault("custom_banks", [])
        return UserEntity(**data)

    async def find_by_email(self, email: str) -> Optional[UserEntity]:
        doc = await self._col.find_one({"email": email})
        return self._to_entity(doc) if doc else None

    async def find_by_id(self, user_id: str) -> Optional[UserEntity]:
        try:
            doc = await self._col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
        return self._to_entity(doc) if doc else None

    async def create(self, user: UserEntity) -> UserEntity:
        now = datetime.now(timezone.utc)
        data = user.model_dump(exclude={"id"})
        data["created_at"] = now
        data["updated_at"] = now
        data["token_version"] = 0
        result = await self._col.insert_one(data)
        user.id = str(result.inserted_id)
        return user

    async def email_exists(self, email: str) -> bool:
        doc = await self._col.find_one({"email": email}, {"_id": 1})
        return doc is not None

    async def update_password(self, user_id: str, hashed_password: str) -> bool:
        result = await self._col.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "password_hash": hashed_password,
                    "updated_at": datetime.now(timezone.utc),
                },
                "$inc": {"token_version": 1},
            },
        )
        return result.modified_count > 0

    async def invalidate_token(self, user_id: str) -> None:
        await self._col.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"token_version": 1}},
        )

    async def update_email(self, user_id: str, new_email: str) -> bool:
        result = await self._col.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "email": new_email,
                    "last_email_change": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                },
                "$inc": {"token_version": 1},
            },
        )
        return result.modified_count > 0

    async def update_profile(
        self,
        user_id: str,
        full_name: Optional[str],
        nickname: Optional[str],
    ) -> Optional[UserEntity]:
        fields: dict = {"updated_at": datetime.now(timezone.utc)}
        if full_name is not None:
            fields["full_name"] = full_name
        if nickname is not None:
            fields["nickname"] = nickname

        await self._col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": fields},
        )
        return await self.find_by_id(user_id)

    async def add_custom_bank(self, user_id: str, bank_name: str) -> bool:
        result = await self._col.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"custom_banks": bank_name}},
        )
        return result.modified_count > 0
