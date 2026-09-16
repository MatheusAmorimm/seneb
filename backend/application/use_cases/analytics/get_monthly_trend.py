from typing import Optional

from backend.application.gate import Gate
from backend.application.use_cases.analytics.base import ScopedAnalyticsUseCase
from backend.application.use_cases.analytics.periods import month_sequence, parse_ymd
from backend.domain.entities.analytics import MonthlyPoint

_MAX_MONTHS = 36


class GetMonthlyTrendUseCase(ScopedAnalyticsUseCase):
    async def execute(
        self,
        user_id: str,
        group_id: Optional[str],
        end: str,
        months: int,
        include_drafts: bool = True,
    ) -> list[MonthlyPoint]:
        Gate().require(1 <= months <= _MAX_MONTHS, f"Meses deve estar entre 1 e {_MAX_MONTHS}.").check()
        parse_ymd(end)

        scope = await self._scope(user_id, group_id)
        month_keys = month_sequence(end, months)
        start = f"{month_keys[0]}-01"

        rows = await self._repo.monthly_totals(scope, start, end, include_drafts)
        by_month = {r.month: r for r in rows}

        # Meses sem lançamentos entram zerados para o gráfico ficar contínuo.
        return [by_month.get(m, MonthlyPoint(month=m)) for m in month_keys]
