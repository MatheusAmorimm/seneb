from typing import List
from bson import ObjectId
from backend.repositories.base_repository import BaseRepository
from backend.schemas import TransactionSchema

# Herdamos de BaseRepository[TransactionSchema, TransactionSchema]
# Isso significa: "Entra um TransactionSchema, Sai um TransactionSchema"
class TransactionRepository(BaseRepository[TransactionSchema, TransactionSchema]):
    def __init__(self, db):
        super().__init__(db, "transactions", TransactionSchema)

    async def get_drafts_by_user(self, user_id: str) -> List[TransactionSchema]:
        """
        Busca apenas os 'rascunhos' (lançamentos atuais do mês).
        É isso que alimenta a tela principal.
        """
        # Usamos o list_all do pai, apenas passando o filtro extra
        return await self.list_all({"user_id": user_id, "status": "draft"})

    async def get_by_report(self, user_id: str, report_id: str) -> List[TransactionSchema]:
        """
        Busca transações vinculadas a um fechamento de mês específico (Histórico).
        """
        return await self.list_all({"user_id": user_id, "report_id": report_id})

    async def finalize_batch(self, transaction_ids: List[str], report_id: str) -> int:
        """
        Regra de Negócio: Fechamento de Mês.
        Pega várias transações, muda status para 'finalized' e vincula ao Relatório.
        """
        if not transaction_ids:
            return 0

        # Converte IDs string para ObjectId para o Mongo entender
        ids = [ObjectId(_id) for _id in transaction_ids if ObjectId.is_valid(_id)]
        
        result = await self.collection.update_many(
            {"_id": {"$in": ids}},
            {"$set": {"status": "finalized", "report_id": report_id}}
        )
        return result.modified_count
    
    async def revert_to_draft(self, user_id: str, report_id: str):
        """Volta todas as transações de um relatório para 'draft'"""
        await self.collection.update_many(
            {"user_id": user_id, "report_id": report_id},
            {"$set": {"status": "draft", "report_id": None}}
        )
        
    async def delete_by_report(self, user_id: str, report_id: str):
        """Deleta todas as transações de um relatório (Exclusão permanente)"""
        await self.collection.delete_many(
            {"user_id": user_id, "report_id": report_id}
        )