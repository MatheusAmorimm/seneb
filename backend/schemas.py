from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

# --- USER SCHEMAS ---

class UserSchema(BaseModel):
    id: Optional[str] = None
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
class ReportSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str  # Ex: "Planejamento Fevereiro 2026"
    reference_month: str # "02/2026"
    
    total_income: float
    total_expense: float
    balance: float
    
    created_at: datetime = Field(default_factory=datetime.now)
class TransactionSchema(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None # Injetado pelo backend
    description: str
    amount: float
    type: str     
    category: str 
    date: str
    
    payment_method: Optional[str] = None
    bank: Optional[str] = None
    
    # Controle de Parcelas
    is_installment: bool = False
    current_installment: int = 1
    total_installments: int = 1
    installment_identifier: Optional[str] = None # "1/10"
    
    # Controle de Estado do Planejamento
    status: str = "draft"  # 'draft' (Lançamentos) ou 'finalized' (Histórico)
    report_id: Optional[str] = None # ID do relatório quando finalizado