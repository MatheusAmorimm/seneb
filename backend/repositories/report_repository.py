from typing import Optional
from backend.repositories.base_repository import BaseRepository
from backend.schemas import ReportSchema

class ReportRepository(BaseRepository[ReportSchema, ReportSchema]):
    def __init__(self, db):
        super().__init__(db, "reports", ReportSchema)

    async def get_by_month_and_user(self, user_id: str, name: str) -> Optional[ReportSchema]:
        """Verifica se já existe um relatório com este nome para este usuário"""
        # Nota: Idealmente checaríamos por 'reference_month' também, mas mantive sua regra de 'name'
        doc = await self.collection.find_one({"user_id": user_id, "name": name})
        if doc:
            return ReportSchema(**doc)
        return None