from backend.application.policies.report_access import ReportAccessPolicy
from backend.core.exceptions import NotFoundException
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class DeleteReportUseCase:
    def __init__(
        self,
        report_repo: IReportRepository,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._report_repo = report_repo
        self._transaction_repo = transaction_repo
        self._policy = ReportAccessPolicy(group_repo)

    async def execute(self, report_id: str, current_user_id: str) -> None:
        report = await self._report_repo.find_by_id(report_id)
        if not report:
            raise NotFoundException("Relatório não encontrado.")

        await self._policy.assert_can_modify(report, current_user_id)

        await self._transaction_repo.delete_by_report(report_id)
        await self._report_repo.delete(report_id)
