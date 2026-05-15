from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.report import ReportEntity


class IReportRepository(ABC):
    @abstractmethod
    async def create(self, report: ReportEntity) -> ReportEntity: ...

    @abstractmethod
    async def find_by_user(self, user_id: str) -> list[ReportEntity]: ...

    @abstractmethod
    async def find_by_id(
        self,
        report_id: str,
        user_id: str,
    ) -> Optional[ReportEntity]: ...

    @abstractmethod
    async def name_exists(
        self,
        name: str,
        user_id: Optional[str],
        group_id: Optional[str],
    ) -> bool: ...

    @abstractmethod
    async def delete(self, report_id: str) -> None: ...
