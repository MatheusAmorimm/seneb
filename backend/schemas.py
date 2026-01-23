from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from enum import Enum


# Isso evita erros de digitação como "Credito" vs "Crédito"
class TransactionType(str, Enum):
    INCOME = "Receita"
    EXPENSE = "Despesa"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "Cartão de Crédito"
    DEBIT_CARD = "Cartão de Débito"
    PIX = "Pix"
    CASH = "Dinheiro"
    BOLETO = "Boleto"
    TRANSFER = "Transferência"
    OTHER = "Outros"


class InstallmentInfo(BaseModel):
    """Modelo para controlar parcelas"""

    current: int = Field(..., ge=1, description="Número da parcela atual")
    total: int = Field(..., ge=1, description="Total de parcelas")

    @field_validator("current")
    @classmethod
    def check_consistency(cls, v, info):
        # Validação simples será feita no nível superior ou DB
        return v


class TransactionBase(BaseModel):
    """
    Dados comuns para criar ou ler uma transação.
    Aqui usamos Decimal para o dinheiro. NUNCA float.
    """

    description: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1)

    amount: Decimal = Field(..., gt=0, description="Valor positivo da transação")

    type: TransactionType
    payment_method: Optional[PaymentMethod] = None
    bank_name: Optional[str] = None

    date_ref: date = Field(default_factory=date.today)

    # Parcelamento é opcional
    installments: Optional[InstallmentInfo] = None


class TransactionCreate(TransactionBase):
    """
    O que o Frontend envia para criar uma transação.
    Não precisa de ID (o banco gera).
    """

    pass


class TransactionResponse(TransactionBase):
    """
    O que o Backend devolve para o Frontend.
    Inclui o ID do banco de dados e o ID do usuário dono.
    """

    id: str  # Representação string do ObjectId do MongoDB
    user_id: str
    created_at: date

    class ConfigDict:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """Recebe a senha em texto puro para criar a conta"""

    password: str = Field(..., min_length=6)
    confirm_password: str  # Será validado na lógica de serviço


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Nunca devolvemos a senha!"""

    id: str
    is_active: bool = True


class UserSchema(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime


class TransactionSchema(BaseModel):
    # Vinculo com o usuário (Obrigatório)
    user_id: str

    # Dados Visuais (Obrigatórios)
    description: str
    amount: float  # Valor numérico puro. O Frontend formata o R$
    type: str  # "Receita" | "Despesa"
    category: str  # "Salário", "Transporte", "Compra", etc.
    date_created: str  # "DD/MM/YYYY" (Padrão visual) ou datetime ISO

    # Só para despesas específicas
    payment_method: Optional[str] = None  # "Crédito", "Pix", "Boleto"
    bank_name: Optional[str] = None  # "Nubank", "Itaú"

    # Lógica de Parcelamento
    is_installment: bool = False  # Gatilho para mostrar "1/10"
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None

    # Ex: "Jan/2026". Se estiver vazio, é o mês atual/aberto.
    reference_month: str

    # Define se essa transação já foi "fechada" e não pode ser editada
    is_archived: bool = False
