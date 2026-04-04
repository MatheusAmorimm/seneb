from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional, List
from backend.core.types import PyObjectId

class GroupMemberModel(BaseModel):
    user_id: str
    role: str  # 'admin' or 'guest'
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GroupModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    owner_id: str
    members: List[GroupMemberModel] = Field(default_factory=list)
    
    is_active: bool = True
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
