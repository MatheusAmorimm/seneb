from typing import Optional

from backend.application.gate import Gate
from backend.application.use_cases.analytics.base import ScopedAnalyticsUseCase
from backend.application.use_cases.analytics.periods import validate_range
from backend.domain.entities.analytics import BreakdownItem
from backend.domain.interfaces.analytics_repository import BREAKDOWN_DIMENSIONS, BREAKDOWN_KINDS

_MAX_LIMIT = 50


class GetBreakdownUseCase(ScopedAnalyticsUseCase):
    async def execute(
        self,
        user_id: str,
        group_id: Optional[str],
        start: str,
        end: str,
        include_drafts: bool,
        dimension: str,
        kind: str,
        limit: int,
    ) -> tuple[float, list[BreakdownItem]]:
        """Retorna (total do tipo no período, itens ordenados com share preenchido)."""
        Gate().require(dimension in BREAKDOWN_DIMENSIONS, "Dimensão inválida.").require(
            kind in BREAKDOWN_KINDS, "Tipo inválido."
        ).require(1 <= limit <= _MAX_LIMIT, f"Limite deve estar entre 1 e {_MAX_LIMIT}.").check()
        validate_range(start, end)

        scope = await self._scope(user_id, group_id)
        items = await self._repo.breakdown(scope, start, end, include_drafts, dimension, kind)

        total = sum(i.total for i in items)
        for item in items:
            item.share = round(item.total / total, 4) if total else 0.0

        return round(total, 2), items[:limit]
