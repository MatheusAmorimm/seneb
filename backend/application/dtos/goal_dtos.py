from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GoalInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: float = Field(..., gt=0)
    deadline: str  # "YYYY-MM-DD"
    image_base64: Optional[str] = None


class GoalUpdateInput(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[float] = Field(None, gt=0)
    deadline: Optional[str] = None
    image_base64: Optional[str] = None


class GoalOutput(BaseModel):
    id: str
    user_id: str
    name: str
    target_amount: float
    deadline: str
    image_base64: Optional[str] = None
    current_amount: float
    is_celebrated: bool
    celebrated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class GoalMonthlyTotalOutput(BaseModel):
    total: float
