from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
from bson import ObjectId
from backend.core.database import db
from backend.models.user_model import UserModel
from backend.core.deps import get_current_user # <--- Importamos a segurança

router = APIRouter()

class TransactionSchema(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None # Novo campo (interno)
    description: str
    amount: float
    type: str
    category: str
    date: str
    payment_method: Optional[str] = None
    bank: Optional[str] = None
    is_installment: bool = False
    total_installments: int = 1
    installment_identifier: Optional[str] = None

# --- GET: Listar (Filtrado por Usuário) ---
@router.get("", response_model=List[TransactionSchema])
async def get_transactions(
    current_user: UserModel = Depends(get_current_user) # <--- O porteiro
):
    # Agora buscamos APENAS onde user_id == id do usuário logado
    cursor = db.db.transactions.find({"user_id": str(current_user.id)}).sort("date", -1).limit(1000)
    transactions = await cursor.to_list(length=1000)
    
    for t in transactions:
        if "_id" in t:
            t["id"] = str(t["_id"])
            
    return transactions

# --- POST: Criar (Vinculado ao Usuário) ---
@router.post("", response_model=TransactionSchema, status_code=201)
async def create_transaction(
    transaction: TransactionSchema,
    current_user: UserModel = Depends(get_current_user) # <--- O porteiro
):
    transaction_dict = transaction.model_dump()
    
    # 1. Injeta o ID do dono da transação
    transaction_dict["user_id"] = str(current_user.id)
    
    if not transaction_dict.get("id"):
        transaction_dict["id"] = str(uuid4())
        
    result = await db.db.transactions.insert_one(transaction_dict)
    transaction_dict["id"] = str(result.inserted_id)
    
    return transaction_dict

# --- DELETE: Apagar (Apenas se for dono) ---
@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    # Lógica Robusta:
    # 1. O usuário DEVE ser o dono (user_id match)
    # 2. O ID pode ser um UUID (campo "id") OU um ObjectId (campo "_id")
    
    filters = []
    
    # Se for um ObjectId válido (24 chars hex), adiciona à busca pelo _id
    if ObjectId.is_valid(transaction_id):
        filters.append({"_id": ObjectId(transaction_id)})
    
    # Sempre adiciona a busca pelo campo "id" (string UUID)
    filters.append({"id": transaction_id})

    # Monta a query final com segurança
    query = {
        "user_id": str(current_user.id), # Trava de segurança do usuário
        "$or": filters
    }
    
    # DEBUG (Opcional - pode remover depois)
    print(f"Tentando deletar com query: {query}")

    result = await db.db.transactions.delete_one(query)
    
    if result.deleted_count == 1:
        return {"message": "Deletado com sucesso"}
    
    # Se chegou aqui, ou não achou, ou não pertence ao usuário
    raise HTTPException(status_code=404, detail="Transação não encontrada.")