from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ReportOutput(BaseModel):
    id: Optional[str] = None
    user_id: str
    group_id: Optional[str] = None
    name: str
    reference_month: str
    total_income: float
    total_expense: float
    balance: float
    created_at: Optional[datetime] = None
