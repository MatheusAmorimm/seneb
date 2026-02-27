import logging
import certifi # 🚀 Nova importação
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from backend.core.configs import settings

logger = logging.getLogger("__name__")

class Database:
    client: Optional[AsyncIOMotorClient] = None

    async def connect_to_mongo(self):
        logger.info("Initializing database connection...")
        try:
            # 🚀 A MÁGICA AQUI: tlsCAFile ensina o Docker a confiar no MongoDB Atlas
            self.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                tlsCAFile=certifi.where()
            )
            await self.client.admin.command('ping')
            logger.info("Database connection established successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to the database: {e}")
            raise e

    async def close_mongo_connection(self):
        logger.info("Closing database connection...")
        if self.client:
            self.client.close()
            logger.info("Database connection closed.")

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self.client is None:
            raise ConnectionError("Database client not initialized!")
        return self.client[settings.DATABASE_NAME]

db = Database()