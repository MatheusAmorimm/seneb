from pydantic import BaseModel
from typing import Optional, Literal


class TransactionEntity(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    group_id: Optional[str] = None
    description: str
    amount: float
    type: Literal["income", "expense"]
    category: str
    subcategory: Optional[str] = None
    date: str
    due_date: Optional[str] = None
    payment_method: Optional[Literal[
        "credit_card", "debit_card", "cash", "pix", "bill", "automatic_debit"
    ]] = None
    bank: Optional[str] = None
    is_installment: bool = False
    current_installment: int = 1
    total_installments: int = 1
    installment_identifier: Optional[str] = None
    status: Literal["draft", "finalized"] = "draft"
    report_id: Optional[str] = None
