from abc import ABC, abstractmethod

from backend.domain.entities.analytics import (
    AnalyticsScope,
    AnalyticsTotals,
    BreakdownItem,
    MonthlyPoint,
    UpcomingDueItem,
)

BREAKDOWN_DIMENSIONS = ("category", "subcategory", "payment_method", "bank")
BREAKDOWN_KINDS = ("expense", "income")


class IAnalyticsRepository(ABC):
    """Agregações sobre a coleção de lançamentos.

    Todas as somas usam o valor efetivo (parcela) e respeitam o escopo
    pessoal/grupo. Datas são strings YYYY-MM-DD inclusivas.
    """

    @abstractmethod
    async def totals(
        self,
        scope: AnalyticsScope,
        start: str,
        end: str,
        include_drafts: bool,
    ) -> AnalyticsTotals: ...

    @abstractmethod
    async def breakdown(
        self,
        scope: AnalyticsScope,
        start: str,
        end: str,
        include_drafts: bool,
        dimension: str,
        kind: str,
    ) -> list[BreakdownItem]:
        """Todos os grupos da dimensão, ordenados por total desc, com share=0."""

    @abstractmethod
    async def monthly_totals(
        self,
        scope: AnalyticsScope,
        start: str,
        end: str,
        include_drafts: bool,
    ) -> list[MonthlyPoint]:
        """Somente meses com dados, em ordem crescente."""

    @abstractmethod
    async def upcoming_due(
        self,
        scope: AnalyticsScope,
        start: str,
        end: str,
    ) -> list[UpcomingDueItem]:
        """Despesas em rascunho com vencimento no intervalo; days_left relativo a start."""
