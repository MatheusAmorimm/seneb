from typing import Optional

from pydantic import BaseModel


class AnalyticsScope(BaseModel):
    """Escopo de uma análise: pessoal (group_id vazio) ou de um grupo."""

    user_id: str
    group_id: Optional[str] = None


class PeriodRange(BaseModel):
    start: str  # YYYY-MM-DD, inclusivo
    end: str  # YYYY-MM-DD, inclusivo


class AnalyticsTotals(BaseModel):
    income: float = 0.0
    expense: float = 0.0
    goal_saved: float = 0.0
    balance: float = 0.0
    savings_rate: float = 0.0  # fração (0..1) do que sobrou da receita
    transaction_count: int = 0

    @classmethod
    def build(
        cls,
        income: float,
        expense: float,
        goal_saved: float,
        transaction_count: int,
    ) -> "AnalyticsTotals":
        balance = income - expense
        rate = (balance / income) if income > 0 else 0.0
        return cls(
            income=round(income, 2),
            expense=round(expense, 2),
            goal_saved=round(goal_saved, 2),
            balance=round(balance, 2),
            savings_rate=round(rate, 4),
            transaction_count=transaction_count,
        )


class AnalyticsSummary(BaseModel):
    period: PeriodRange
    previous_period: PeriodRange
    include_drafts: bool
    current: AnalyticsTotals
    previous: AnalyticsTotals
    delta_pct: dict[str, Optional[float]]  # income, expense, goal_saved, balance


class BreakdownItem(BaseModel):
    label: str
    total: float
    count: int
    share: float = 0.0  # fração do total do tipo (0..1)


class MonthlyPoint(BaseModel):
    month: str  # YYYY-MM
    income: float = 0.0
    expense: float = 0.0
    goal_saved: float = 0.0
    balance: float = 0.0


class UpcomingDueItem(BaseModel):
    transaction_id: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    amount: float
    due_date: str
    days_left: int
    payment_method: Optional[str] = None
    bank: Optional[str] = None
