from pydantic import BaseModel
from typing import Optional, Literal


class TransactionEntity(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    group_id: Optional[str] = None
    description: Optional[str] = None
    amount: float
    type: Literal["income", "expense", "goal"]
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
    goal_id: Optional[str] = None
    status: Literal["draft", "finalized"] = "draft"
    report_id: Optional[str] = None

    @property
    def effective_amount(self) -> float:
        """Valor que efetivamente pesa no mês.

        Compras parceladas guardam o valor total em `amount`; o que conta no
        mês é a parcela. É a mesma regra exibida na tela de Lançamentos.
        """
        if self.is_installment and self.total_installments and self.total_installments > 1:
            return self.amount / self.total_installments
        return self.amount
