from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timezone
from typing import Literal

# --- USER SCHEMAS ---

class UserSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    full_name: str
    nickname: Optional[str] = None
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str  # <--- O NOVO CAMPO (Obrigatório)
    full_name: str
    nickname: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TransactionBase(BaseModel):
    description: str
    amount: float
    type: Literal["income", "expense"] # Ou str, se preferir deixar livre
    category: str
    date_created: str          # Ex: "2024-02-20"
    reference_month: str       # Ex: "02-2024" (Importante para dashboard)
    
    # Opcionais
    payment_method: Optional[str] = None
    bank_name: Optional[str] = None
    
    # Lógica de Parcelamento
    is_installment: bool = False
    installment_current: Optional[int] = None 
    installment_total: Optional[int] = None
class TransactionCreate(TransactionBase):
    pass
class TransactionSchema(TransactionBase):
    id: str = Field(..., alias="_id") # Mapeia o _id do Mongo
    user_id: str
    is_archived: bool = False         # Padrão do banco
    created_at_system: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)) # Data real do registro no sistema
    class Config:
        populate_by_name = True