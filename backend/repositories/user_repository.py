from typing import Optional
from backend.repositories.base_repository import BaseRepository
from backend.schemas import UserSchema, UserCreate
from backend.core.security import get_password_hash
from bson import ObjectId

# Herdamos passando: [TipoDeRetorno, TipoDeEntrada]
class UserRepository(BaseRepository[UserSchema, UserCreate]):
    def __init__(self, db):
        # Passamos UserSchema para o construtor saber o que retornar nas buscas
        super().__init__(db, "users", UserSchema)

    async def create(self, obj_in: UserCreate) -> UserSchema:
        """
        Sobrescreve create para hash de senha.
        """
        user_dict = obj_in.model_dump(exclude={"password", "confirm_password", "id"})
        user_dict["hashed_password"] = get_password_hash(obj_in.password)
        
        result = await self.collection.insert_one(user_dict)
        
        user_dict["_id"] = result.inserted_id
        return UserSchema(**user_dict)

    async def get_by_email(self, email: str) -> Optional[UserSchema]:
        document = await self.collection.find_one({"email": email})
        if document:
            return UserSchema(**document)
        return None
    
    async def add_custom_bank(self, user_id: str, bank_name: str) -> bool:
        """Adiciona um banco à lista sem duplicar ($addToSet)"""
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"custom_banks": bank_name}}
        )
        return result.modified_count > 0