from typing import Optional

from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class ListDraftTransactionsUseCase:
    def __init__(
        self,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._transaction_repo = transaction_repo
        self._group_repo = group_repo

    async def execute(
        self,
        current_user_id: str,
        group_id: Optional[str] = None,
        reopened_report_id: Optional[str] = None,
    ) -> list[TransactionEntity]:
        if group_id:
            if not await self._group_repo.is_member(group_id, current_user_id):
                raise ForbiddenException("Acesso negado ao grupo.")

        return await self._transaction_repo.find_drafts(
            user_id=current_user_id if not group_id else None,
            group_id=group_id,
            reopened_report_id=reopened_report_id,
        )
