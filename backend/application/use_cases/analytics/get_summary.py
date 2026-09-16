from typing import Optional

from backend.application.use_cases.analytics.base import ScopedAnalyticsUseCase
from backend.application.use_cases.analytics.periods import previous_range, validate_range
from backend.domain.entities.analytics import AnalyticsSummary, PeriodRange

_DELTA_KEYS = ("income", "expense", "goal_saved", "balance")


def _delta_pct(current: float, previous: float) -> Optional[float]:
    if previous == 0:
        return None
    return round((current - previous) / abs(previous) * 100, 2)


class GetSummaryUseCase(ScopedAnalyticsUseCase):
    async def execute(
        self,
        user_id: str,
        group_id: Optional[str],
        start: str,
        end: str,
        include_drafts: bool = True,
    ) -> AnalyticsSummary:
        validate_range(start, end)
        scope = await self._scope(user_id, group_id)
        prev = previous_range(start, end)

        current = await self._repo.totals(scope, start, end, include_drafts)
        previous = await self._repo.totals(scope, prev.start, prev.end, include_drafts)

        delta = {k: _delta_pct(getattr(current, k), getattr(previous, k)) for k in _DELTA_KEYS}

        return AnalyticsSummary(
            period=PeriodRange(start=start, end=end),
            previous_period=prev,
            include_drafts=include_drafts,
            current=current,
            previous=previous,
            delta_pct=delta,
        )
