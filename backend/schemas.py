from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

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

class TransactionSchema(BaseModel):
    user_id: str 
    description: str
    amount: float
    type: str     
    category: str 
    date_created: str
    
    payment_method: Optional[str] = None
    bank_name: Optional[str] = None
    
    is_installment: bool = False
    installment_current: Optional[int] = None 
    installment_total: Optional[int] = None
    
    reference_month: str 
    is_archived: bool = False