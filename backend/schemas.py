from typing import Optional, List, Annotated
from pydantic import BaseModel, Field, EmailStr, ConfigDict, BeforeValidator
from datetime import datetime

# --- CONFIGURAÇÃO: O Segredo do ObjectId ---
# Isso ensina o Pydantic a tratar ObjectId como string
PyObjectId = Annotated[str, BeforeValidator(str)]

class MongoModel(BaseModel):
    """
    Classe base para modelos do MongoDB.
    - Mapeia '_id' (banco) para 'id' (código).
    - Permite criação via dicionário ou objeto.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda v: v.isoformat()}
    )

# --- USER SCHEMAS ---
class UserSchema(MongoModel):
    email: EmailStr
    full_name: str
    nickname: Optional[str] = None
    created_at: Optional[datetime] = None
    custom_banks: List[str] = []

# Input não herda de MongoModel pois não tem ID ainda
class UserCreate(BaseModel): 
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str
    full_name: str
    nickname: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserSchema] = None
class TokenData(BaseModel):
    username: Optional[str] = None
    
# --- OUTROS SCHEMAS (Atualizados) ---
class ReportSchema(MongoModel):
    user_id: str
    name: str
    reference_month: str
    total_income: float
    total_expense: float
    balance: float
    created_at: datetime = Field(default_factory=datetime.now)

class TransactionSchema(MongoModel):
    user_id: Optional[str] = None
    description: str
    amount: float
    type: str     
    category: str 
    date: str
    due_date: Optional[str] = None
    payment_method: Optional[str] = None
    bank: Optional[str] = None
    
    is_installment: bool = False
    current_installment: int = 1
    total_installments: int = 1
    installment_identifier: Optional[str] = None
    
    status: str = "draft"
    report_id: Optional[str] = None

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    date: Optional[str] = None
    due_date: Optional[str] = None
    payment_method: Optional[str] = None
    bank: Optional[str] = None
    
class BankAdd(BaseModel):
    bank_name: str