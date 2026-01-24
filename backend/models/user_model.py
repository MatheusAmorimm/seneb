from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timezone
from typing import Optional
from backend.core.types import PyObjectId  # <--- Importando do arquivo novo

class UserModel(BaseModel):
    # Usamos o PyObjectId que está no outro arquivo
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    
    email: EmailStr
    password_hash: str
    full_name: str
    nickname: Optional[str] = None
    
    is_active: bool = True
    is_superuser: bool = False
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        from_attributes = True