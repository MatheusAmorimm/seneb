from backend.application.dtos.transaction_dtos import TransactionInput
from backend.application.gate import Gate
from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class CreateTransactionUseCase:
    def __init__(
        self,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
    ) -> None:
        self._transaction_repo = transaction_repo
        self._group_repo = group_repo

    async def execute(
        self,
        data: TransactionInput,
        current_user_id: str,
    ) -> TransactionEntity:
        if data.group_id:
            group = await self._group_repo.find_by_id(data.group_id)
            if not group:
                raise NotFoundException("Grupo não encontrado.")

            role = await self._group_repo.get_member_role(data.group_id, current_user_id)
            Gate().require(role is not None, "Acesso negado ao grupo.").require(
                role != "guest",
                "Apenas administradores podem inserir lançamentos.",
            ).check()

        entity = TransactionEntity(
            user_id=current_user_id,
            group_id=data.group_id,
            description=data.description,
            amount=data.amount,
            type=data.type,
            category=data.category,
            subcategory=data.subcategory,
            date=data.date,
            due_date=data.due_date,
            payment_method=data.payment_method,
            bank=data.bank,
            is_installment=data.is_installment,
            current_installment=data.current_installment,
            total_installments=data.total_installments,
            goal_id=data.goal_id if data.type == "goal" else None,
            status="draft",
        )

        return await self._transaction_repo.create(entity)
