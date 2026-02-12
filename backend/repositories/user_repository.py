from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.user_model import UserModel
from typing import Optional

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def create(self, user: UserModel) -> UserModel:
        user_dict = user.model_dump(by_alias=True, exclude={"id"})
        
        # --- DEBUG: O que estamos enviando pro banco? ---
        print("\n📝 [WRITE DEBUG] Tentando salvar este dicionário no Mongo:")
        print(user_dict)
        # ------------------------------------------------
        
        result = await self.collection.insert_one(user_dict)
        user.id = str(result.inserted_id)
        
        print(f"✅ [WRITE SUCCESS] Salvo com ID: {user.id}\n")
        return user

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        print(f"\n🔍 [READ DEBUG] Buscando exatamente por: '{email}'")
        
        # Tenta achar o usuário
        document = await self.collection.find_one({"email": email})
        
        if document:
            print(f"✅ [READ DEBUG] Encontrado! ID: {document.get('_id')}")
            return UserModel(**document)
        else:
            # --- DEBUG FINAL: Se não achou, quem DIABOS está lá? ---
            print("❌ [READ DEBUG] Não encontrado. Listando TODOS os usuários do banco:")
            all_users = await self.collection.find().to_list(length=10)
            for u in all_users:
                print(f"   👤 Existente: {u.get('email')} | ID: {u.get('_id')}")
            print("---------------------------------------------------\n")
            # -------------------------------------------------------
            return None

    async def get_by_id(self, user_id: str) -> Optional[UserModel]:
        from bson import ObjectId
        try:
            document = await self.collection.find_one({"_id": ObjectId(user_id)})
            if document:
                return UserModel(**document)
        except Exception:
            return None
        return None