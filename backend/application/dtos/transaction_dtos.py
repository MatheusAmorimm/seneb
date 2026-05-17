from typing import Optional, Literal

from pydantic import BaseModel, Field


class TransactionInput(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    amount: float = Field(..., gt=0)
    type: Literal["income", "expense", "goal"]
    category: str = Field(..., max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    date: str
    due_date: Optional[str] = None
    payment_method: Optional[Literal[
        "credit_card", "debit_card", "cash", "pix", "bill", "automatic_debit"
    ]] = None
    bank: Optional[str] = Field(None, max_length=100)
    is_installment: bool = False
    current_installment: int = Field(1, ge=1)
    total_installments: int = Field(1, ge=1)
    group_id: Optional[str] = None
    goal_id: Optional[str] = None


class TransactionUpdateInput(BaseModel):
    description: Optional[str] = Field(None, max_length=500)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    type: Optional[Literal["income", "expense", "goal"]] = None
    date: Optional[str] = None
    due_date: Optional[str] = None
    payment_method: Optional[Literal[
        "credit_card", "debit_card", "cash", "pix", "bill", "automatic_debit"
    ]] = None
    bank: Optional[str] = Field(None, max_length=100)
    is_installment: Optional[bool] = None
    current_installment: Optional[int] = Field(None, ge=1)
    total_installments: Optional[int] = Field(None, ge=1)
    installment_identifier: Optional[str] = None
    goal_id: Optional[str] = None


class FinalizeInput(BaseModel):
    report_name: str = Field(..., min_length=1, max_length=200)
    reference_month: str
    reopened_report_id: Optional[str] = None
    group_id: Optional[str] = None


class TransactionOutput(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    group_id: Optional[str] = None
    description: Optional[str] = None
    amount: float
    type: str
    category: str
    subcategory: Optional[str] = None
    date: str
    due_date: Optional[str] = None
    payment_method: Optional[str] = None
    bank: Optional[str] = None
    is_installment: bool
    current_installment: int
    total_installments: int
    installment_identifier: Optional[str] = None
    goal_id: Optional[str] = None
    status: str
    report_id: Optional[str] = None
