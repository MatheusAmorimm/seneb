from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.domain.entities.report import ReportEntity
from backend.domain.interfaces.report_repository import IReportRepository

_REPORTS_LIMIT = 100


class MongoReportRepository(IReportRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["reports"]

    def _to_entity(self, doc: dict) -> ReportEntity:
        data = dict(doc)
        if "id" not in data and "_id" in data:
            data["id"] = str(data["_id"])
        data.pop("_id", None)
        return ReportEntity(**data)

    async def create(self, report: ReportEntity) -> ReportEntity:
        data = report.model_dump()
        data["created_at"] = datetime.now(timezone.utc)
        await self._col.insert_one(data)
        report.created_at = data["created_at"]
        return report

    async def find_by_user(self, user_id: str) -> list[ReportEntity]:
        docs = await (
            self._col.find({"user_id": user_id, "group_id": {"$in": [None, ""]}})
            .sort("created_at", -1)
            .to_list(_REPORTS_LIMIT)
        )
        return [self._to_entity(d) for d in docs]

    async def find_by_group(self, group_id: str) -> list[ReportEntity]:
        docs = await (
            self._col.find({"group_id": group_id})
            .sort("created_at", -1)
            .to_list(_REPORTS_LIMIT)
        )
        return [self._to_entity(d) for d in docs]

    async def find_by_id(self, report_id: str) -> Optional[ReportEntity]:
        doc = await self._col.find_one({"id": report_id})
        return self._to_entity(doc) if doc else None

    async def name_exists(
        self,
        name: str,
        user_id: Optional[str],
        group_id: Optional[str],
    ) -> bool:
        query: dict = {"name": name}
        if group_id:
            query["group_id"] = group_id
        else:
            query["user_id"] = user_id
            query["group_id"] = {"$in": [None, ""]}
        doc = await self._col.find_one(query, {"_id": 1})
        return doc is not None

    async def delete(self, report_id: str) -> None:
        await self._col.delete_one({"id": report_id})
