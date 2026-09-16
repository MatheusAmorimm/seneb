from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.report import ReportEntity


class IReportRepository(ABC):
    @abstractmethod
    async def create(self, report: ReportEntity) -> ReportEntity: ...

    @abstractmethod
    async def find_by_user(self, user_id: str) -> list[ReportEntity]:
        """Somente relatórios pessoais do usuário (sem group_id)."""

    @abstractmethod
    async def find_by_group(self, group_id: str) -> list[ReportEntity]: ...

    @abstractmethod
    async def find_by_id(self, report_id: str) -> Optional[ReportEntity]:
        """Busca sem filtro de dono; o controle de acesso é feito pelo caso de uso."""

    @abstractmethod
    async def name_exists(
        self,
        name: str,
        user_id: Optional[str],
        group_id: Optional[str],
    ) -> bool: ...

    @abstractmethod
    async def delete(self, report_id: str) -> None: ...
