from backend.application.dtos.transaction_dtos import TransactionUpdateInput
from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class UpdateTransactionUseCase:
    def __init__(
        self,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._transaction_repo = transaction_repo
        self._group_repo = group_repo

    async def execute(
        self,
        transaction_id: str,
        data: TransactionUpdateInput,
        current_user_id: str,
    ) -> TransactionEntity:
        existing = await self._transaction_repo.find_by_id(transaction_id)
        if not existing:
            raise NotFoundException("Transação não encontrada.")

        await self._assert_permission(existing, current_user_id)

        updates = data.model_dump(exclude_unset=True)
        if not updates:
            return existing

        updated = await self._transaction_repo.update(transaction_id, updates)
        if not updated:
            raise NotFoundException("Erro ao recuperar transação atualizada.")

        return updated

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
            raise ForbiddenException("Transação não pertence a você.")
