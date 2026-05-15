from backend.core.exceptions import NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class GetReportTransactionsUseCase:
    def __init__(
        self,
        report_repo: IReportRepository,
        transaction_repo: ITransactionRepository,
    ) -> None:
        self._report_repo = report_repo
        self._transaction_repo = transaction_repo

    async def execute(
        self,
        report_id: str,
        current_user_id: str,
    ) -> list[TransactionEntity]:
        report = await self._report_repo.find_by_id(report_id, current_user_id)
        if not report:
            raise NotFoundException("Relatório não encontrado.")

        return await self._transaction_repo.find_finalized_by_report(
            report_id=report_id,
            user_id=current_user_id,
        )
