from typing import Optional, List, Annotated
from pydantic import BaseModel, Field, EmailStr, ConfigDict, BeforeValidator
from datetime import datetime, timezone

# --- Configuração de Tipagem para ObjectId (Pydantic v2) ---
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserModel(BaseModel):
    # Configuração robusta para aceitar _id e converter tipos
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda v: v.isoformat()}
    )

    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    full_name: str
    nickname: Optional[str] = None
    hashed_password: str 
    custom_banks: List[str] = Field(default_factory=list)
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))