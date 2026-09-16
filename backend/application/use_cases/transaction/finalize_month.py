from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from backend.application.dtos.transaction_dtos import FinalizeInput
from backend.application.gate import Gate
from backend.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from backend.domain.entities.report import ReportEntity
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class FinalizeMonthUseCase:
    def __init__(
        self,
        transaction_repo: ITransactionRepository,
        report_repo: IReportRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._transaction_repo = transaction_repo
        self._report_repo = report_repo
        self._group_repo = group_repo

    async def execute(self, data: FinalizeInput, current_user_id: str) -> str:
        if data.group_id:
            group = await self._group_repo.find_by_id(data.group_id)
            if not group:
                raise NotFoundException("Grupo não encontrado.")
            role = await self._group_repo.get_member_role(data.group_id, current_user_id)
            Gate().require(
                role is not None and role != "guest",
                "Acesso negado para fechar mês neste grupo.",
            ).check()

        name_taken = await self._report_repo.name_exists(
            name=data.report_name,
            user_id=current_user_id if not data.group_id else None,
            group_id=data.group_id,
        )
        if name_taken:
            raise ConflictException("Já existe um relatório com esse nome.")

        drafts = await self._transaction_repo.find_drafts(
            user_id=current_user_id if not data.group_id else None,
            group_id=data.group_id,
            reopened_report_id=data.reopened_report_id,
        )

        Gate().require(len(drafts) > 0, "Não há lançamentos para finalizar.").check()

        # Usa o valor efetivo (parcela) para bater com os totais da tela de Lançamentos.
        total_income = round(sum(t.effective_amount for t in drafts if t.type == "income"), 2)
        total_expense = round(sum(t.effective_amount for t in drafts if t.type == "expense"), 2)
        report_id = str(uuid4())

        report = ReportEntity(
            id=report_id,
            user_id=current_user_id,
            group_id=data.group_id,
            name=data.report_name,
            reference_month=data.reference_month,
            total_income=total_income,
            total_expense=total_expense,
            balance=total_income - total_expense,
        )
        await self._report_repo.create(report)

        next_installments = self._project_next_installments(drafts)

        await self._transaction_repo.finalize_drafts(
            user_id=current_user_id if not data.group_id else None,
            group_id=data.group_id,
            report_id=report_id,
            reopened_report_id=data.reopened_report_id,
        )

        if next_installments:
            await self._transaction_repo.create_many(next_installments)

        return report_id

    def _project_next_installments(
        self, drafts: list[TransactionEntity]
    ) -> list[TransactionEntity]:
        result = []
        for item in drafts:
            if item.is_installment and item.current_installment < item.total_installments:
                next_num = item.current_installment + 1
                next_t = item.model_copy(
                    update={
                        "id": str(uuid4()),
                        "current_installment": next_num,
                        "installment_identifier": f"{next_num}/{item.total_installments}",
                        "status": "draft",
                        "report_id": None,
                    }
                )
                result.append(next_t)
        return result
