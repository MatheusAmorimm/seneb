from typing import Generic, TypeVar, List, Optional, Type
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from pydantic import BaseModel

# M = Model (Saída, ex: UserSchema)
ModelType = TypeVar("ModelType", bound=BaseModel)
# C = Create (Entrada, ex: UserCreate)
CreateType = TypeVar("CreateType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateType]):
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str, model_class: Type[ModelType]):
        self.collection = db[collection_name]
        self.model_class = model_class

    async def create(self, obj_in: CreateType) -> ModelType:
        # Serializa ignorando o id
        obj_dict = obj_in.model_dump(by_alias=True, exclude={"id"})
        
        result = await self.collection.insert_one(obj_dict)
        
        # Injeta o ID gerado
        obj_dict["_id"] = result.inserted_id
        return self.model_class(**obj_dict)

    async def get_by_id(self, id: str) -> Optional[ModelType]:
        if not ObjectId.is_valid(id):
            return None
        try:
            doc = await self.collection.find_one({"_id": ObjectId(id)})
            if doc:
                return self.model_class(**doc)
        except Exception:
            return None
        return None

    async def list_all(self, filters: Optional[dict] = None) -> List[ModelType]:
        query = filters if filters is not None else {}
        cursor = self.collection.find(query)
        docs = await cursor.to_list(length=None)
        return [self.model_class(**doc) for doc in docs]

    async def delete(self, id: str) -> bool:
        if not ObjectId.is_valid(id):
            return False
        try:
            result = await self.collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except Exception:
            return False
        
    async def update(self, id: str, obj_in: BaseModel | dict) -> Optional[ModelType]:
        if not ObjectId.is_valid(id):
            return None
            
        # Se for um Pydantic model, converte para dict excluindo nulos
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        
        if not update_data:
            return await self.get_by_id(id)

        # Atualiza no banco
        await self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
        # Retorna o objeto atualizado
        return await self.get_by_id(id)