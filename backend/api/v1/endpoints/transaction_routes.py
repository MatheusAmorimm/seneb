from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.core.database import db
from backend.schemas import TransactionSchema, TransactionUpdate
from bson import ObjectId
from backend.core.security import get_current_user
from backend.models.user_model import UserModel
from typing import List, Optional, Dict, Any
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
async def get_draft_transactions(
    report_id: Optional[str] = None, 
    group_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    # Verificação de grupo
    base_query: Dict[str, Any] = {"status": "draft"}
    if group_id:
        try:
            group_oid = ObjectId(group_id)
        except:
            group_oid = group_id
        group = await db.db.groups.find_one({"_id": group_oid, "members.user_id": str(current_user.id)})
        if not group:
            raise HTTPException(status_code=403, detail="Acesso negado ao grupo.")
        base_query["group_id"] = group_id
    else:
        base_query["user_id"] = str(current_user.id)
        base_query["group_id"] = {"$in": [None, ""]}

    if report_id:
        # MODO REABERTO
        base_query["$or"] = [
            {"report_id": report_id},
            {"report_id": None}, 
            {"report_id": ""}, 
            {"report_id": {"$exists": False}}
        ]
    else:
        # MODO NORMAL
        base_query["$or"] = [
            {"report_id": None}, 
            {"report_id": ""}, 
            {"report_id": {"$exists": False}}
        ]
        
    transactions = await db.db.transactions.find(base_query).to_list(1000)
    return [prepare_transaction(t) for t in transactions]

# --- POST: Criar Transação (Adiciona ao Rascunho) ---
@router.post("", response_model=TransactionSchema)
async def create_transaction(
    transaction: TransactionSchema, 
    current_user = Depends(get_current_user)
):
    data = transaction.dict()
    data["status"] = "draft" # Sempre nasce como rascunho
    
    if data.get("group_id"):
        try:
            group_oid = ObjectId(data["group_id"])
        except:
            group_oid = data["group_id"]
        group = await db.db.groups.find_one({"_id": group_oid})
        if not group:
            raise HTTPException(status_code=404, detail="Grupo não encontrado.")
        
        # Verifica permissão 'admin'
        member = next((m for m in group.get("members", []) if m["user_id"] == str(current_user.id)), None)
        if not member:
            raise HTTPException(status_code=403, detail="Acesso negado ao grupo.")
        if member["role"] == "guest":
            raise HTTPException(status_code=403, detail="Permissão negada. Apenas administradores podem inserir lançamentos.")
            
        data["user_id"] = str(current_user.id) # Quem adicionou
    else:
        data["user_id"] = str(current_user.id)
    
    if not data.get("id"):
        data["id"] = str(uuid4())
        
    # Lógica simples de Identificador de Parcela para exibição
    if data["is_installment"] and data["total_installments"] > 1:
        data["installment_identifier"] = f"{data['current_installment']}/{data['total_installments']}"

    await db.db.transactions.insert_one(data)
    return prepare_transaction(data)

@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: str,
    current_user = Depends(get_current_user)
):
    """
    Remove uma transação (Aceita UUID ou ObjectId).
    """
    
    # 1. Busca Transação
    try:
        query_id = ObjectId(transaction_id)
    except:
        query_id = transaction_id
        
    existing = await db.db.transactions.find_one({"$or": [{"_id": query_id}, {"id": transaction_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Transação não encontrada.")
        
    # 2. Verificação de Permissão (Pessoal ou Grupo)
    if existing.get("group_id"):
        try:
            group_oid = ObjectId(existing["group_id"])
        except:
            group_oid = existing["group_id"]
        group = await db.db.groups.find_one({"_id": group_oid})
        if not group:
            raise HTTPException(status_code=404, detail="Grupo não encontrado.")
            
        member = next((m for m in group.get("members", []) if m["user_id"] == str(current_user.id)), None)
        if not member or member["role"] == "guest":
            raise HTTPException(status_code=403, detail="Apenas administradores podem modificar este lançamento.")
    else:
        if str(existing.get("user_id")) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Esta transação não pertence a você.")

    # 3. Tenta deletar
    await db.db.transactions.delete_one({"_id": existing["_id"]})
    return None

# --- POST: FINALIZAR O MÊS (A Mágica) ---
class FinalizeRequest(BaseModel):
    report_name: str 
    reference_month: str 
    reopened_report_id: str | None = None
    group_id: str | None = None

@router.post("/finalize")
async def finalize_planning(
    request: FinalizeRequest,
    current_user = Depends(get_current_user)
):
    # Verificação de Grupo para Finalização
    query_existing: Dict[str, Any] = {"name": request.report_name}
    query_drafts: Dict[str, Any] = {"status": "draft"}
    
    if request.group_id:
        try:
            group_oid = ObjectId(request.group_id)
        except:
            group_oid = request.group_id
        group = await db.db.groups.find_one({"_id": group_oid})
        if not group:
            raise HTTPException(status_code=404, detail="Grupo não encontrado.")
        member = next((m for m in group.get("members", []) if m["user_id"] == str(current_user.id)), None)
        if not member or member["role"] == "guest":
            raise HTTPException(status_code=403, detail="Acesso negado para fechar mês neste grupo.")
        
        query_existing["group_id"] = request.group_id
        query_drafts["group_id"] = request.group_id
    else:
        query_existing["user_id"] = str(current_user.id)
        query_existing["group_id"] = {"$in": [None, ""]}
        query_drafts["user_id"] = str(current_user.id)
        query_drafts["group_id"] = {"$in": [None, ""]}

    existing_report = await db.db.reports.find_one(query_existing)
    if existing_report:
        raise HTTPException(status_code=400, detail="Já existe um relatório com esse nome para este contexto.")

    # 🚀 BUSCA BLINDADA PARA FINALIZAR
    if request.reopened_report_id:
        query_drafts["$or"] = [
            {"report_id": request.reopened_report_id},
            {"report_id": None}, 
            {"report_id": ""}, 
            {"report_id": {"$exists": False}}
        ]
    else:
        query_drafts["$or"] = [{"report_id": None}, {"report_id": ""}, {"report_id": {"$exists": False}}]

    # 1. Busca usando a query correta
    drafts = await db.db.transactions.find(query_drafts).to_list(None)

    if not drafts:
        raise HTTPException(status_code=400, detail="Não há lançamentos para finalizar.")

    # 2. Cálculos para o Holerite
    total_income = sum(t['amount'] for t in drafts if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in drafts if t['type'] == 'expense')
    
    # 3. Criar o Objeto Relatório
    report_id = str(uuid4())
    new_report = {
        "id": report_id,
        "user_id": str(current_user.id),
        "group_id": request.group_id,
        "name": request.report_name,
        "reference_month": request.reference_month,
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "created_at": datetime.now(),
    }
    
    await db.db.reports.insert_one(new_report)

    # 4. Processar Itens: Finalizar Atuais & Gerar Futuros
    next_month_transactions = []

    for item in drafts:
        if item.get("is_installment") and item.get("current_installment", 1) < item.get("total_installments", 1):
            
            next_installment = item.copy()
            next_installment["id"] = str(uuid4())

            if "_id" in next_installment:
                del next_installment["_id"]

            next_installment["current_installment"] += 1
            next_installment["installment_identifier"] = f"{next_installment['current_installment']}/{next_installment['total_installments']}"
            next_installment["status"] = "draft" 
            next_installment["report_id"] = None
            
            next_month_transactions.append(next_installment)

    # 🚀 ATUALIZAÇÃO BLINDADA: Atualiza apenas o pacote certo usando a query_drafts
    await db.db.transactions.update_many(
        query_drafts,
        {"$set": {"status": "finalized", "report_id": report_id}} 
    )

    if next_month_transactions:
        await db.db.transactions.insert_many(next_month_transactions)

    return {"message": "Mês finalizado com sucesso!", "report_id": report_id}

@router.put("/{transaction_id}", response_model=TransactionSchema)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user = Depends(get_current_user)
):
    """
    Atualiza uma transação existente (Aceita UUID ou ObjectId).
    """
    
    # 1. Busca Transação
    try:
        query_id = ObjectId(transaction_id)
    except:
        query_id = transaction_id
        
    existing_transaction = await db.db.transactions.find_one({"$or": [{"_id": query_id}, {"id": transaction_id}]})
    if not existing_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada.")
        
    # 2. Verificação de Permissão (Pessoal ou Grupo)
    if existing_transaction.get("group_id"):
        try:
            group_oid = ObjectId(existing_transaction["group_id"])
        except:
            group_oid = existing_transaction["group_id"]
        group = await db.db.groups.find_one({"_id": group_oid})
        if not group:
            raise HTTPException(status_code=404, detail="Grupo não encontrado.")
            
        member = next((m for m in group.get("members", []) if m["user_id"] == str(current_user.id)), None)
        if not member or member["role"] == "guest":
            raise HTTPException(status_code=403, detail="Apenas administradores podem modificar este lançamento.")
    else:
        if str(existing_transaction.get("user_id")) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Transação não pertence a você.")

    # 3. Filtrar dados para update
    update_data = transaction_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado enviado para atualização.")

    # 4. Atualizar no Banco (Usando o _id original encontrado para garantir precisão)
    await db.db.transactions.update_one(
        {"_id": existing_transaction["_id"]},
        {"$set": update_data}
    )

    # 5. Retornar a transação atualizada
    updated_transaction = await db.db.transactions.find_one({"_id": existing_transaction["_id"]})
    
    if not updated_transaction:
        raise HTTPException(status_code=404, detail="Erro ao recuperar transação atualizada.")
    
    # Conversão para o Schema
    transaction_dict = {k: v for k, v in updated_transaction.items()}
    
    if "_id" in transaction_dict:
        transaction_dict["id"] = str(transaction_dict["_id"])
        del transaction_dict["_id"]
    
    return TransactionSchema(**transaction_dict)