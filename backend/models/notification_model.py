from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional

from backend.core.types import PyObjectId

class NotificationModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str  # Who receives the notification
    title: str
    message: str
    type: str  # 'group_invite', 'info', 'alert'
    read: bool = False
    
    # Allows attaching custom payload data (e.g. group_id or role)
    meta_data: Optional[dict] = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
