from fastapi import APIRouter, Depends, status, Response, HTTPException
from typing import List
from backend.core.database import db
from backend.schemas import ReportSchema, TransactionSchema
from backend.core.security import get_current_user
from backend.models.user_model import UserModel

router = APIRouter()

# --- HELPER: Padronização de Documentos ---
def prepare_doc(doc):
    """
    Limpa o documento MongoDB para ser compatível com Pydantic v2.
    Serve tanto para Relatórios quanto para Transações.
    """
    if not doc:
        return doc
    
    # Se não tiver 'id' (UUID), usa o '_id' do Mongo convertido para string
    if "id" not in doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
    
    # Remove o '_id' original para evitar erro de validação (já que removemos o alias do Schema)
    if "_id" in doc:
        del doc["_id"]
        
    return doc

@router.get("", response_model=List[ReportSchema])
async def get_reports(current_user: UserModel = Depends(get_current_user)):
    """
    Lista os relatórios (Cards de Resumo).
    """
    reports = await db.db.reports.find({
        "user_id": str(current_user.id)
    }).sort("created_at", -1).to_list(100)
    
    return [prepare_doc(report) for report in reports]

@router.get("/{report_id}/transactions", response_model=List[TransactionSchema])
async def get_report_details(
    report_id: str, 
    current_user: UserModel = Depends(get_current_user)
):
    """
    Lista as transações de um relatório específico.
    """
    # Busca transações que pertencem a este relatório E estão finalizadas

    report_exists = await db.db.reports.find_one({
        "id": report_id,
        "user_id": str(current_user.id)
    })
    
    if not report_exists:
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")

    transactions = await db.db.transactions.find({
        "user_id": str(current_user.id),
        "report_id": report_id,
        "status": "finalized"
    }).to_list(None)
    
    if not transactions:
        return []
    
    # Aplica a mesma limpeza robusta das transações ao vivo
    return [prepare_doc(t) for t in transactions]

@router.delete("/{report_id}/reopen", status_code=status.HTTP_204_NO_CONTENT)
async def reopen_report(
    report_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    report = await db.db.reports.find_one({"id": report_id, "user_id": str(current_user.id)})
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")

    # 🚀 PASSO 1: Busca os itens que estão sendo reabertos ANTES de mudar o status
    reopened_items = await db.db.transactions.find({
        "report_id": report_id, 
        "user_id": str(current_user.id)
    }).to_list(None)

    # 🚀 PASSO 2: Desfazimento em Cascata (Deleta as parcelas projetadas para frente)
    for item in reopened_items:
        if item.get("is_installment") and item.get("current_installment", 1) < item.get("total_installments", 1):
            next_installment = item.get("current_installment") + 1
            
            # Deleta a parcela "filha" que estava solta nos lançamentos atuais
            await db.db.transactions.delete_one({
                "user_id": str(current_user.id),
                "status": "draft",
                "description": item.get("description"), # Usa a descrição como âncora
                "current_installment": next_installment,
                "$or": [{"report_id": None}, {"report_id": ""}, {"report_id": {"$exists": False}}]
            })

    # 🚀 PASSO 3: Volta os itens do histórico para edição (Mantendo o ID do lote!)
    await db.db.transactions.update_many(
        {"report_id": report_id, "user_id": str(current_user.id)},
        {"$set": {"status": "draft"}}
    )

    # Passo 4: Exclui a capa do relatório
    await db.db.reports.delete_one({"id": report_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report_permanently(
    report_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """
    EXCLUSÃO PERMANENTE: Remove o relatório e todas as transações associadas a ele.
    Cuidado: Isso destrói os dados históricos.
    """
    # 1. Verifica existência
    report = await db.db.reports.find_one({
        "id": report_id, 
        "user_id": str(current_user.id)
    })
    
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")

    # 2. Exclui as transações históricas desse relatório
    await db.db.transactions.delete_many({
        "report_id": report_id, 
        "user_id": str(current_user.id)
    })

    # 3. Exclui o documento do Relatório
    await db.db.reports.delete_one({"id": report_id})
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)