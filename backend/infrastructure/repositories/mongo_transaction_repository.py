from typing import Optional
from uuid import uuid4

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.transaction_repository import ITransactionRepository

_DRAFT_QUERY_LIMIT = 1000
_NO_REPORT = [{"report_id": None}, {"report_id": ""}, {"report_id": {"$exists": False}}]


class MongoTransactionRepository(ITransactionRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["transactions"]

    def _to_entity(self, doc: dict) -> TransactionEntity:
        data = dict(doc)
        if "id" not in data:
            data["id"] = str(data["_id"])
        data.pop("_id", None)
        return TransactionEntity(**data)

    @staticmethod
    def _id_filter(transaction_id: str) -> dict:
        """Documentos antigos usam ObjectId em `_id`; os novos guardam um uuid em `id`."""
        try:
            return {"$or": [{"_id": ObjectId(transaction_id)}, {"id": transaction_id}]}
        except Exception:
            return {"id": transaction_id}

    def _draft_base_query(
        self,
        user_id: Optional[str],
        group_id: Optional[str],
        reopened_report_id: Optional[str],
    ) -> dict:
        query: dict = {"status": "draft"}

        if group_id:
            query["group_id"] = group_id
        else:
            query["user_id"] = user_id
            query["group_id"] = {"$in": [None, ""]}

        if reopened_report_id:
            query["$or"] = [{"report_id": reopened_report_id}, *_NO_REPORT]
        else:
            query["$or"] = list(_NO_REPORT)

        return query

    async def find_drafts(
        self,
        user_id: Optional[str],
        group_id: Optional[str],
        reopened_report_id: Optional[str] = None,
    ) -> list[TransactionEntity]:
        query = self._draft_base_query(user_id, group_id, reopened_report_id)
        docs = await self._col.find(query).to_list(_DRAFT_QUERY_LIMIT)
        return [self._to_entity(d) for d in docs]

    async def find_finalized_by_report(self, report_id: str) -> list[TransactionEntity]:
        docs = await self._col.find({"report_id": report_id, "status": "finalized"}).to_list(None)
        return [self._to_entity(d) for d in docs]

    async def find_by_id(self, transaction_id: str) -> Optional[TransactionEntity]:
        doc = await self._col.find_one(self._id_filter(transaction_id))
        return self._to_entity(doc) if doc else None

    async def create(self, transaction: TransactionEntity) -> TransactionEntity:
        data = transaction.model_dump()
        if not data.get("id"):
            data["id"] = str(uuid4())
        if transaction.is_installment and transaction.total_installments > 1:
            data["installment_identifier"] = (
                f"{transaction.current_installment}/{transaction.total_installments}"
            )
        await self._col.insert_one(data)
        transaction.id = data["id"]
        return transaction

    async def create_many(self, transactions: list[TransactionEntity]) -> None:
        if not transactions:
            return
        docs = [t.model_dump() for t in transactions]
        await self._col.insert_many(docs)

    async def update(
        self,
        transaction_id: str,
        updates: dict,
    ) -> Optional[TransactionEntity]:
        doc = await self._col.find_one(self._id_filter(transaction_id), {"_id": 1})
        if not doc:
            return None
        await self._col.update_one({"_id": doc["_id"]}, {"$set": updates})
        updated = await self._col.find_one({"_id": doc["_id"]})
        return self._to_entity(updated) if updated else None

    async def delete(self, transaction_id: str) -> bool:
        doc = await self._col.find_one(self._id_filter(transaction_id), {"_id": 1})
        if not doc:
            return False
        result = await self._col.delete_one({"_id": doc["_id"]})
        return result.deleted_count > 0

    async def finalize_drafts(
        self,
        user_id: Optional[str],
        group_id: Optional[str],
        report_id: str,
        reopened_report_id: Optional[str],
    ) -> None:
        query = self._draft_base_query(user_id, group_id, reopened_report_id)
        await self._col.update_many(
            query,
            {"$set": {"status": "finalized", "report_id": report_id}},
        )

    async def find_for_reopen(self, report_id: str) -> list[TransactionEntity]:
        docs = await self._col.find({"report_id": report_id}).to_list(None)
        return [self._to_entity(d) for d in docs]

    async def reopen_transactions(self, report_id: str) -> None:
        await self._col.update_many({"report_id": report_id}, {"$set": {"status": "draft"}})

    async def delete_by_report(self, report_id: str) -> None:
        await self._col.delete_many({"report_id": report_id})

    async def delete_draft_installment(
        self,
        user_id: Optional[str],
        group_id: Optional[str],
        description: Optional[str],
        installment_number: int,
    ) -> None:
        query: dict = {
            "status": "draft",
            "description": description,
            "current_installment": installment_number,
            "$or": list(_NO_REPORT),
        }
        if group_id:
            query["group_id"] = group_id
        else:
            query["user_id"] = user_id
            query["group_id"] = {"$in": [None, ""]}
        await self._col.delete_one(query)

    async def sum_goal_contributions(self, user_id: str) -> dict[str, float]:
        pipeline = [
            {"$match": {"user_id": user_id, "type": "goal", "goal_id": {"$nin": [None, ""]}}},
            {"$group": {"_id": "$goal_id", "total": {"$sum": "$amount"}}},
        ]
        rows = await self._col.aggregate(pipeline).to_list(None)
        return {str(r["_id"]): float(r["total"]) for r in rows}

    async def sum_goal_contribution(self, goal_id: str) -> float:
        pipeline = [
            {"$match": {"type": "goal", "goal_id": goal_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        rows = await self._col.aggregate(pipeline).to_list(1)
        return float(rows[0]["total"]) if rows else 0.0

    async def sum_goal_month(self, user_id: str, month_prefix: str) -> float:
        pipeline = [
            {"$match": {"user_id": user_id, "type": "goal", "date": {"$regex": f"^{month_prefix}"}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        rows = await self._col.aggregate(pipeline).to_list(1)
        return float(rows[0]["total"]) if rows else 0.0
