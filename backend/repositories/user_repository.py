from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.user_model import UserModel
from typing import Optional

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def create(self, user: UserModel) -> UserModel:
        user_dict = user.model_dump(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(user_dict)
        user.id = str(result.inserted_id)
        return user

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        
        # Tenta achar o usuário
        document = await self.collection.find_one({"email": email})
        
        if document:
            return UserModel(**document)
        else:
            all_users = await self.collection.find().to_list(length=10)
            return None

    async def update_password(self, email: str, hashed_password: str) -> bool:
        result = await self.collection.update_one(
            {"email": email},
            {"$set": {"password_hash": hashed_password}}
        )
        return result.modified_count > 0

    async def get_by_id(self, user_id: str) -> Optional[UserModel]:
        from bson import ObjectId
        try:
            document = await self.collection.find_one({"_id": ObjectId(user_id)})
            if document:
                return UserModel(**document)
        except Exception:
            return None
        return None