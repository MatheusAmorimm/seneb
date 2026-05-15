from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class DeleteTransactionUseCase:
    def __init__(
        self,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._transaction_repo = transaction_repo
        self._group_repo = group_repo

    async def execute(self, transaction_id: str, current_user_id: str) -> None:
        existing = await self._transaction_repo.find_by_id(transaction_id)
        if not existing:
            raise NotFoundException("Transação não encontrada.")

        await self._assert_permission(existing, current_user_id)

        await self._transaction_repo.delete(transaction_id)

    async def _assert_permission(
        self,
        transaction: TransactionEntity,
        user_id: str,
    ) -> None:
        if transaction.group_id:
            role = await self._group_repo.get_member_role(transaction.group_id, user_id)
            if role is None or role == "guest":
                raise ForbiddenException(
                    "Apenas administradores podem modificar este lançamento."
                )
        elif transaction.user_id != user_id:
            raise ForbiddenException("Esta transação não pertence a você.")
