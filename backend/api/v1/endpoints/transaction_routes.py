from typing import List, Any
from fastapi import APIRouter, HTTPException, Depends, status, Body
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4
from backend.core.configs import settings
from backend.core.database import db
from backend.core.security import get_current_user
from backend.models.user_model import UserModel
from backend.schemas import TransactionSchema, TransactionUpdate
from backend.repositories.transaction_repository import TransactionRepository

router = APIRouter()

# --- DEPENDENCY INJECTION ---
def get_transaction_repo() -> TransactionRepository:
    # Correção do Erro 1: Verificação explícita do cliente
    if not db.client:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    database = db.client.get_database(settings.DATABASE_NAME)
    return TransactionRepository(database)

# --- SCHEMAS LOCAIS ---
class FinalizeRequest(BaseModel):
    report_name: str
    reference_month: str

# --- ROTAS ---

@router.get("/draft", response_model=List[TransactionSchema])
async def get_draft_transactions(
    current_user: UserModel = Depends(get_current_user),
    repo: TransactionRepository = Depends(get_transaction_repo)
) -> Any:
    """
    Lista apenas os lançamentos em RASCUNHO (Mês Atual).
    """
    # Correção do Erro 2: Garantir que user.id é string
    if not current_user.id:
        raise HTTPException(status_code=400, detail="User ID invalid")
        
    return await repo.get_drafts_by_user(str(current_user.id))

@router.post("/", response_model=TransactionSchema, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_in: TransactionSchema,
    current_user: UserModel = Depends(get_current_user),
    repo: TransactionRepository = Depends(get_transaction_repo)
) -> Any:
    """
    Cria uma nova transação.
    """
    # Garantia de ID
    if not current_user.id:
        raise HTTPException(status_code=400, detail="User ID invalid")

    transaction_in.user_id = str(current_user.id)
    transaction_in.status = "draft"
    
    if transaction_in.is_installment and transaction_in.total_installments > 1:
        transaction_in.installment_identifier = (
            f"{transaction_in.current_installment}/{transaction_in.total_installments}"
        )

    return await repo.create(transaction_in)

@router.put("/{transaction_id}", response_model=TransactionSchema)
async def update_transaction(
    transaction_id: str,
    transaction_in: TransactionUpdate,
    current_user: UserModel = Depends(get_current_user),
    repo: TransactionRepository = Depends(get_transaction_repo)
) -> Any:
    """
    Atualiza uma transação.
    """
    existing = await repo.get_by_id(transaction_id)
    # Comparação segura de IDs
    if not existing or str(existing.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    return await repo.update(transaction_id, transaction_in)

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    current_user: UserModel = Depends(get_current_user),
    repo: TransactionRepository = Depends(get_transaction_repo)
) -> None:  # <--- CORREÇÃO: Mude de -> Any para -> None
    """
    Remove uma transação.
    """
    existing = await repo.get_by_id(transaction_id)
    if not existing or str(existing.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    deleted = await repo.delete(transaction_id)
    return None

# --- FINALIZAÇÃO DE MÊS ---
@router.post("/finalize", status_code=status.HTTP_200_OK)
async def finalize_month(
    request: FinalizeRequest,
    current_user: UserModel = Depends(get_current_user),
    repo: TransactionRepository = Depends(get_transaction_repo)
) -> Any:
    if not db.client:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    user_id = str(current_user.id)
    if not user_id:
         raise HTTPException(status_code=400, detail="User ID invalid")

    # 1. Busca drafts
    drafts = await repo.get_drafts_by_user(user_id)
    if not drafts:
        raise HTTPException(status_code=400, detail="Não há lançamentos para finalizar.")

    # 2. Cálculos
    total_income = sum(t.amount for t in drafts if t.type == 'income')
    total_expense = sum(t.amount for t in drafts if t.type == 'expense')
    
    # 3. Criação do Relatório (Acesso direto seguro)
    db_instance = db.client.get_database(settings.DATABASE_NAME)
    
    existing_report = await db_instance["reports"].find_one({
        "user_id": user_id,
        "name": request.report_name
    })
    if existing_report:
        raise HTTPException(status_code=400, detail="Relatório já existe.")

    new_report = {
        "user_id": user_id,
        "name": request.report_name,
        "reference_month": request.reference_month,
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "created_at": datetime.now()
    }
    result_report = await db_instance["reports"].insert_one(new_report)
    report_id = str(result_report.inserted_id)

    # 4. Processar Itens
    ids_to_finalize = []
    
    for item in drafts:
        # Garante que item.id é string para a lista
        if item.id:
            ids_to_finalize.append(str(item.id))
        
        if item.is_installment and item.current_installment < item.total_installments:
            next_data = item.model_dump(exclude={"id", "created_at", "status", "report_id"})
            
            next_data["current_installment"] += 1
            next_data["installment_identifier"] = f"{next_data['current_installment']}/{next_data['total_installments']}"
            next_data["status"] = "draft"
            next_data["user_id"] = user_id
            
            new_transaction = TransactionSchema(**next_data)
            await repo.create(new_transaction)

    # 5. Finaliza
    await repo.finalize_batch(ids_to_finalize, report_id)

    return {"message": "Mês finalizado com sucesso!", "report_id": report_id}