from datetime import date

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.analytics import (
    AnalyticsScope,
    AnalyticsTotals,
    BreakdownItem,
    MonthlyPoint,
    UpcomingDueItem,
)
from backend.domain.interfaces.analytics_repository import IAnalyticsRepository

_UPCOMING_LIMIT = 200

# Valor efetivo: parcela para compras parceladas, valor cheio para o resto.
# Mesma regra de TransactionEntity.effective_amount, aplicada dentro do Mongo.
_EFFECTIVE_AMOUNT_STAGE = {
    "$addFields": {
        "effective_amount": {
            "$cond": [
                {
                    "$and": [
                        {"$eq": ["$is_installment", True]},
                        {"$gt": [{"$ifNull": ["$total_installments", 1]}, 1]},
                    ]
                },
                {"$divide": ["$amount", "$total_installments"]},
                "$amount",
            ]
        }
    }
}


class MongoAnalyticsRepository(IAnalyticsRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["transactions"]

    @staticmethod
    def _scope_match(scope: AnalyticsScope) -> dict:
        if scope.group_id:
            return {"group_id": scope.group_id}
        return {"user_id": scope.user_id, "group_id": {"$in": [None, ""]}}

    @staticmethod
    def _period_match(start: str, end: str, include_drafts: bool) -> dict:
        match: dict = {"date": {"$gte": start, "$lte": end}}
        if not include_drafts:
            match["status"] = "finalized"
        return match

    async def totals(self, scope, start, end, include_drafts):
        pipeline = [
            {"$match": {**self._scope_match(scope), **self._period_match(start, end, include_drafts)}},
            _EFFECTIVE_AMOUNT_STAGE,
            {"$group": {"_id": "$type", "total": {"$sum": "$effective_amount"}, "count": {"$sum": 1}}},
        ]
        rows = {r["_id"]: r for r in await self._col.aggregate(pipeline).to_list(None)}

        def total_of(kind: str) -> float:
            return float(rows.get(kind, {}).get("total", 0.0))

        return AnalyticsTotals.build(
            income=total_of("income"),
            expense=total_of("expense"),
            goal_saved=total_of("goal"),
            transaction_count=int(sum(r["count"] for r in rows.values())),
        )

    async def breakdown(self, scope, start, end, include_drafts, dimension, kind):
        field = f"${dimension}"
        pipeline = [
            {
                "$match": {
                    **self._scope_match(scope),
                    **self._period_match(start, end, include_drafts),
                    "type": kind,
                }
            },
            _EFFECTIVE_AMOUNT_STAGE,
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": [{"$ifNull": [field, ""]}, ""]},
                            "Não informado",
                            field,
                        ]
                    },
                    "total": {"$sum": "$effective_amount"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"total": -1, "_id": 1}},
        ]
        rows = await self._col.aggregate(pipeline).to_list(None)
        return [
            BreakdownItem(label=str(r["_id"]), total=round(float(r["total"]), 2), count=int(r["count"]))
            for r in rows
        ]

    async def monthly_totals(self, scope, start, end, include_drafts):
        pipeline = [
            {"$match": {**self._scope_match(scope), **self._period_match(start, end, include_drafts)}},
            _EFFECTIVE_AMOUNT_STAGE,
            {
                "$group": {
                    "_id": {"month": {"$substrBytes": ["$date", 0, 7]}, "type": "$type"},
                    "total": {"$sum": "$effective_amount"},
                }
            },
        ]
        acc: dict[str, dict[str, float]] = {}
        for r in await self._col.aggregate(pipeline).to_list(None):
            month = acc.setdefault(r["_id"]["month"], {"income": 0.0, "expense": 0.0, "goal": 0.0})
            month[r["_id"]["type"]] = float(r["total"])

        return [
            MonthlyPoint(
                month=key,
                income=round(v["income"], 2),
                expense=round(v["expense"], 2),
                goal_saved=round(v["goal"], 2),
                balance=round(v["income"] - v["expense"], 2),
            )
            for key, v in sorted(acc.items())
        ]

    async def upcoming_due(self, scope, start, end):
        pipeline = [
            {
                "$match": {
                    **self._scope_match(scope),
                    "status": "draft",
                    "type": "expense",
                    "due_date": {"$gte": start, "$lte": end},
                }
            },
            _EFFECTIVE_AMOUNT_STAGE,
            {"$sort": {"due_date": 1}},
            {"$limit": _UPCOMING_LIMIT},
        ]
        start_date = date.fromisoformat(start)
        items: list[UpcomingDueItem] = []
        for d in await self._col.aggregate(pipeline).to_list(None):
            items.append(
                UpcomingDueItem(
                    transaction_id=str(d.get("id") or d["_id"]),
                    description=d.get("description"),
                    category=d.get("category", ""),
                    subcategory=d.get("subcategory"),
                    amount=round(float(d["effective_amount"]), 2),
                    due_date=d["due_date"],
                    days_left=(date.fromisoformat(d["due_date"]) - start_date).days,
                    payment_method=d.get("payment_method"),
                    bank=d.get("bank"),
                )
            )
        return items
