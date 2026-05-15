from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReportEntity(BaseModel):
    id: Optional[str] = None
    user_id: str
    group_id: Optional[str] = None
    name: str
    reference_month: str
    total_income: float
    total_expense: float
    balance: float
    created_at: Optional[datetime] = None
