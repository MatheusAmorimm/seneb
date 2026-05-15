from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserEntity(BaseModel):
    id: Optional[str] = None
    email: str
    password_hash: str
    full_name: str
    nickname: Optional[str] = None
    custom_banks: list[str] = []
    is_active: bool = True
    is_superuser: bool = False
    token_version: int = 0
    last_email_change: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
