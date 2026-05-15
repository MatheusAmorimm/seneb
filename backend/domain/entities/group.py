from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class GroupMemberEntity(BaseModel):
    user_id: str
    role: Literal["admin", "guest"]
    joined_at: Optional[datetime] = None


class GroupEntity(BaseModel):
    id: Optional[str] = None
    name: str
    owner_id: str
    members: list[GroupMemberEntity] = []
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
