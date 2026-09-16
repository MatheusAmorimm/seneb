from typing import Optional

from backend.core.exceptions import ForbiddenException
from backend.domain.entities.report import ReportEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.report_repository import IReportRepository


class ListReportsUseCase:
    def __init__(self, report_repo: IReportRepository, group_repo: IGroupRepository) -> None:
        self._report_repo = report_repo
        self._group_repo = group_repo

    async def execute(
        self,
        current_user_id: str,
        group_id: Optional[str] = None,
    ) -> list[ReportEntity]:
        if group_id:
            if not await self._group_repo.is_member(group_id, current_user_id):
                raise ForbiddenException("Acesso negado ao grupo.")
            return await self._report_repo.find_by_group(group_id)
        return await self._report_repo.find_by_user(current_user_id)
