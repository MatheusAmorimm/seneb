from backend.domain.entities.report import ReportEntity
from backend.domain.interfaces.report_repository import IReportRepository


class ListReportsUseCase:
    def __init__(self, report_repo: IReportRepository) -> None:
        self._report_repo = report_repo

    async def execute(self, current_user_id: str) -> list[ReportEntity]:
        return await self._report_repo.find_by_user(current_user_id)
