from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from backend.core.configs import settings

class Database:
    # Correção 1: Dizemos explicitamente que pode ser None
    client: Optional[AsyncIOMotorClient] = None

    @property
    def db(self):
        # Correção 2: Adicionamos verificação se o cliente existe
        if self.client is None:
            raise ConnectionError("Database client not initialized!")
            
        # Correção 3: Usamos 'settings' (minúsculo) para pegar o valor real do .env
        return self.client[settings.DATABASE_NAME]

db = Database()