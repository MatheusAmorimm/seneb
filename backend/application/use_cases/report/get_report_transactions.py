from backend.application.policies.report_access import ReportAccessPolicy
from backend.core.exceptions import NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class GetReportTransactionsUseCase:
    def __init__(
        self,
        report_repo: IReportRepository,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._report_repo = report_repo
        self._transaction_repo = transaction_repo
        self._policy = ReportAccessPolicy(group_repo)

    async def execute(
        self,
        report_id: str,
        current_user_id: str,
    ) -> list[TransactionEntity]:
        report = await self._report_repo.find_by_id(report_id)
        if not report:
            raise NotFoundException("Relatório não encontrado.")

        await self._policy.assert_can_view(report, current_user_id)

        return await self._transaction_repo.find_finalized_by_report(report_id)
