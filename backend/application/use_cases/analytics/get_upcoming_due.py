from datetime import timedelta
from typing import Optional

from backend.application.gate import Gate
from backend.application.use_cases.analytics.base import ScopedAnalyticsUseCase
from backend.application.use_cases.analytics.periods import parse_ymd, to_ymd
from backend.domain.entities.analytics import UpcomingDueItem

_MAX_DAYS = 90


class GetUpcomingDueUseCase(ScopedAnalyticsUseCase):
    async def execute(
        self,
        user_id: str,
        group_id: Optional[str],
        start: str,
        days: int,
    ) -> list[UpcomingDueItem]:
        Gate().require(1 <= days <= _MAX_DAYS, f"Dias deve estar entre 1 e {_MAX_DAYS}.").check()
        start_date = parse_ymd(start)
        end = to_ymd(start_date + timedelta(days=days))

        scope = await self._scope(user_id, group_id)
        return await self._repo.upcoming_due(scope, start, end)
