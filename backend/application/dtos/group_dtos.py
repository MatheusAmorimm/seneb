from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field


class GroupMemberOutput(BaseModel):
    user_id: str
    role: str


class GroupOutput(BaseModel):
    id: Optional[str] = None
    name: str
    owner_id: str
    members: list[GroupMemberOutput]
    created_at: Optional[datetime] = None


class CreateGroupInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class InviteMemberInput(BaseModel):
    email: EmailStr
    role: Literal["admin", "guest"] = "guest"
