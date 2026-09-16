from datetime import datetime, timezone

from backend.domain.interfaces.transaction_repository import ITransactionRepository


class GetGoalMonthlyTotalUseCase:
    def __init__(self, transaction_repo: ITransactionRepository) -> None:
        self._transaction_repo = transaction_repo

    async def execute(self, user_id: str) -> float:
        month_prefix = datetime.now(timezone.utc).strftime("%Y-%m")  # "2026-09"
        return await self._transaction_repo.sum_goal_month(user_id, month_prefix)
