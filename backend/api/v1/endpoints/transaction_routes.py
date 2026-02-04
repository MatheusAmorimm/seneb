from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.core.database import db
from backend.schemas import TransactionSchema
from backend.core.security import get_current_user
from backend.models.user_model import UserModel
from typing import List
from uuid import uuid4
from datetime import datetime

router = APIRouter()


def prepare_transaction(doc):
    """
    Prepara o documento do MongoDB para o Frontend/Pydantic.
    1. Garante que existe um campo 'id'.
    2. Remove '_id' para evitar conflitos de validação.
    """
    if doc:
        # Se já tem UUID (id), mantemos. Se não, usamos o ObjectId como string.
        if "id" not in doc:
             doc["id"] = str(doc["_id"])
        
        # Remove o _id original para não confundir o Schema (que não tem mais alias)
        if "_id" in doc:
            del doc["_id"]
            
    return doc

# --- GET: Lista apenas o Rascunho (Lançamentos) ---
@router.get("/draft", response_model=List[TransactionSchema])
async def get_draft_transactions(current_user = Depends(get_current_user)):
    # Retorna apenas o que NÃO foi finalizado (status="draft")
    transactions = await db.db.transactions.find({
        "user_id": current_user.id,
        "status": "draft"
    }).to_list(1000)
    return [prepare_transaction(t) for t in transactions]

# --- POST: Criar Transação (Adiciona ao Rascunho) ---
@router.post("/", response_model=TransactionSchema)
async def create_transaction(
    transaction: TransactionSchema, 
    current_user = Depends(get_current_user)
):
    data = transaction.dict()
    data["user_id"] = current_user.id
    data["status"] = "draft" # Sempre nasce como rascunho
    
    if not data.get("id"):
        data["id"] = str(uuid4())
        
    # Lógica simples de Identificador de Parcela para exibição
    if data["is_installment"] and data["total_installments"] > 1:
        data["installment_identifier"] = f"{data['current_installment']}/{data['total_installments']}"

    await db.db.transactions.insert_one(data)
    return prepare_transaction(data)

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    # Nota: Aqui buscamos pelo "id" (UUID) que criamos, não pelo _id do Mongo
    result = await db.db.transactions.delete_one({
        "id": transaction_id,
        "user_id": str(current_user.id),
        "status": "draft"
    })
    
    if result.deleted_count == 1:
        return {"message": "Transação removida"}
    raise HTTPException(status_code=404, detail="Transação não encontrada")

# --- POST: FINALIZAR O MÊS (A Mágica) ---
class FinalizeRequest(BaseModel):
    report_name: str # Ex: "Janeiro 2025"
    reference_month: str # Ex: "01/2025"

@router.post("/finalize")
async def finalize_planning(
    request: FinalizeRequest,
    current_user = Depends(get_current_user)
):
    """
    1. Calcula totais do Rascunho atual.
    2. Cria um Relatório (Snapshot) no histórico.
    3. Marca itens atuais como 'finalized'.
    4. Gera automaticamente as próximas parcelas no novo Rascunho.
    """
    
    existing_report = await db.db.reports.find_one({
        "user_id": current_user.id,
        "or": [
            {"name": request.report_name},
            {"reference_month": request.reference_month}
        ]
    })

    if existing_report:
        raise HTTPException(status_code=400, detail="Já existe um relatório com esse nome ou mês de referência.")

    # 1. Busca todos os drafts do usuário
    drafts = await db.db.transactions.find({
        "user_id": current_user.id,
        "status": "draft"
    }).to_list(None)

    if not drafts:
        raise HTTPException(status_code=400, detail="Não há lançamentos para finalizar.")

    # 2. Cálculos para o Holerite
    total_income = sum(t['amount'] for t in drafts if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in drafts if t['type'] == 'expense')
    
    # 3. Criar o Objeto Relatório
    report_id = str(uuid4())
    new_report = {
        "id": report_id,
        "user_id": current_user.id,
        "name": request.report_name,
        "reference_month": request.reference_month,
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "created_at": datetime.now(),
        "items_snapshot": drafts # Opcional: Salvar uma cópia estática aqui se quiser performance extrema no histórico
    }
    
    await db.db.reports.insert_one(new_report)

    # 4. Processar Itens: Finalizar Atuais & Gerar Futuros
    next_month_transactions = []

    for item in drafts:
        # Se for parcelado e NÃO for a última parcela, joga a próxima pro "Lançamentos" (Draft)
        if item.get("is_installment") and item.get("current_installment") < item.get("total_installments"):
            
            next_installment = item.copy()
            next_installment["id"] = str(uuid4()) # Novo ID

            if "_id" in next_installment:
                del next_installment["_id"]  # Remove o _id original

            next_installment["current_installment"] += 1
            next_installment["installment_identifier"] = f"{next_installment['current_installment']}/{next_installment['total_installments']}"
            next_installment["status"] = "draft" # Vai aparecer na tela "limpa"
            next_installment["report_id"] = None
            
            # Aqui você poderia adicionar lógica para incrementar a data em +30 dias se quisesse
            
            next_month_transactions.append(next_installment)

    # Atualiza os antigos para 'finalized' e vincula ao relatório
    await db.db.transactions.update_many(
        {"user_id": current_user.id, "status": "draft"},
        {"$set": {"status": "finalized", "report_id": report_id}}
    )

    # Insere as parcelas do próximo mês (se houver)
    if next_month_transactions:
        await db.db.transactions.insert_many(next_month_transactions)

    return {"message": "Mês finalizado com sucesso!", "report_id": report_id}