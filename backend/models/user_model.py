from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime, timezone
from typing import Optional, List
from backend.core.types import PyObjectId

class UserModel(BaseModel):
    # Configuração Limpa (Sem json_encoders)
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    password_hash: str
    full_name: str
    nickname: Optional[str] = None

    custom_banks: List[str] = Field(default_factory=list)
    
    is_active: bool = True
    is_superuser: bool = False
    
    last_email_change: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))