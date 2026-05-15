from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class NotificationEntity(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    message: str
    type: Literal["group_invite", "info", "alert"]
    read: bool = False
    meta_data: dict = {}
    created_at: Optional[datetime] = None
