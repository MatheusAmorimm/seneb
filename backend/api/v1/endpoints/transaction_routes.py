from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
from backend.core.database import db 

router = APIRouter()

# --- MODELO DE DADOS (DTO) ---
class TransactionSchema(BaseModel):
    id: Optional[str] = None
    description: str
    amount: float
    type: str
    category: str
    date: str
    
    # Campos opcionais novos
    payment_method: Optional[str] = None
    bank: Optional[str] = None
    is_installment: bool = False
    total_installments: int = 1
    installment_identifier: Optional[str] = None

# --- ROTAS ---

@router.post("/", response_model=TransactionSchema)
async def create_transaction(transaction: TransactionSchema):
    transaction_dict = transaction.dict()
    
    # Garante que tenha um ID string
    if not transaction_dict.get("id"):
        transaction_dict["id"] = str(uuid4())
    new_transaction = await db.db.transactions.insert_one(transaction_dict)
    
    # Retorna o objeto criado
    created_transaction = await db.db.transactions.find_one({"_id": new_transaction.inserted_id})
    return transaction_dict

@router.get("/", response_model=List[TransactionSchema])
async def get_transactions():
    transactions = await db.db.transactions.find().to_list(1000)
    return transactions

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str):
    delete_result = await db.db.transactions.delete_one({"id": transaction_id})
    
    if delete_result.deleted_count == 1:
        return {"message": "Transação deletada com sucesso"}
    
    raise HTTPException(status_code=404, detail="Transação não encontrada")