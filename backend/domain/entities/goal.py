from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GoalEntity(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    target_amount: float
    deadline: str  # "YYYY-MM-DD"
    image_base64: Optional[str] = None
    current_amount: float = 0.0  # computed at query time, not persisted
    is_celebrated: bool = False
    celebrated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
