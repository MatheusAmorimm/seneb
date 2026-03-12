from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_serializer
from datetime import datetime

# --- USER SCHEMAS ---

class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: Optional[str] = None
    email: EmailStr
    full_name: str
    nickname: Optional[str] = None
    created_at: Optional[datetime] = None
    custom_banks: List[str] = []

    @field_serializer('created_at')
    def serialize_datetime(self, created_at: Optional[datetime], _info):
        if created_at is not None:
            # Converter para America/Sao_Paulo se for UTC
            from pytz import timezone
            import pytz
            sp_tz = timezone('America/Sao_Paulo')
            if created_at.tzinfo is None:
                created_at = pytz.utc.localize(created_at)
            return created_at.astimezone(sp_tz).isoformat()
        return None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str  # <--- O NOVO CAMPO (Obrigatório)
    full_name: str
    nickname: Optional[str] = None

class UserSignupResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_nickname: str | None = None

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

    @field_serializer('created_at')
    def serialize_datetime(self, created_at: datetime, _info):
        from pytz import timezone
        import pytz
        sp_tz = timezone('America/Sao_Paulo')
        if created_at.tzinfo is None:
            created_at = pytz.utc.localize(created_at)
        return created_at.astimezone(sp_tz).isoformat()

class BankAdd(BaseModel):
    bank_name: str
class TransactionSchema(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None # Injetado pelo backend
    description: str
    amount: float
    type: str     
    category: str 
    date: str
    due_date: Optional[str] = None

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
    
class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    date: Optional[str] = None
    due_date: Optional[str] = None
    payment_method: Optional[str] = None
    bank: Optional[str] = None