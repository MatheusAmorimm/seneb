from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NotificationOutput(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    meta_data: dict = {}
    created_at: Optional[datetime] = None
