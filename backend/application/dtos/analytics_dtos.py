from typing import Optional

from pydantic import BaseModel


class TotalsOutput(BaseModel):
    income: float
    expense: float
    goal_saved: float
    balance: float
    savings_rate: float
    transaction_count: int


class PeriodOutput(BaseModel):
    start: str
    end: str


class DeltaOutput(BaseModel):
    income: Optional[float] = None
    expense: Optional[float] = None
    goal_saved: Optional[float] = None
    balance: Optional[float] = None


class SummaryOutput(BaseModel):
    period: PeriodOutput
    previous_period: PeriodOutput
    include_drafts: bool
    current: TotalsOutput
    previous: TotalsOutput
    delta_pct: DeltaOutput


class BreakdownItemOutput(BaseModel):
    label: str
    total: float
    count: int
    share: float


class BreakdownOutput(BaseModel):
    dimension: str
    kind: str
    total: float
    items: list[BreakdownItemOutput]


class MonthlyPointOutput(BaseModel):
    month: str
    income: float
    expense: float
    goal_saved: float
    balance: float


class MonthlyTrendOutput(BaseModel):
    points: list[MonthlyPointOutput]


class UpcomingDueItemOutput(BaseModel):
    transaction_id: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    amount: float
    due_date: str
    days_left: int
    payment_method: Optional[str] = None
    bank: Optional[str] = None


class UpcomingDueOutput(BaseModel):
    total: float
    items: list[UpcomingDueItemOutput]
