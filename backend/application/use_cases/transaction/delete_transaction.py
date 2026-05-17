from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.goal_repository import IGoalRepository
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class DeleteTransactionUseCase:
    def __init__(
        self,
        transaction_repo: ITransactionRepository,
        group_repo: IGroupRepository,
        goal_repo: Optional[IGoalRepository] = None,
        db: Optional[AsyncIOMotorDatabase] = None,
    ) -> None:
        self._transaction_repo = transaction_repo
        self._group_repo = group_repo
        self._goal_repo = goal_repo
        self._db = db

    async def execute(self, transaction_id: str, current_user_id: str) -> None:
        existing = await self._transaction_repo.find_by_id(transaction_id)
        if not existing:
            raise NotFoundException("Transação não encontrada.")

        await self._assert_permission(existing, current_user_id)

        goal_id = existing.goal_id if existing.type == "goal" else None

        await self._transaction_repo.delete(transaction_id)

        if goal_id and self._goal_repo and self._db:
            await self._maybe_reset_celebration(goal_id)

    async def _maybe_reset_celebration(self, goal_id: str) -> None:
        goal = await self._goal_repo.find_by_id(goal_id)
        if not goal or not goal.is_celebrated:
            return

        pipeline = [
            {"$match": {"type": "goal", "goal_id": goal_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        agg = await self._db["transactions"].aggregate(pipeline).to_list(1)
        current_amount = agg[0]["total"] if agg else 0.0

        if current_amount < goal.target_amount:
            await self._goal_repo.update(goal_id, {"is_celebrated": False, "celebrated_at": None})

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
