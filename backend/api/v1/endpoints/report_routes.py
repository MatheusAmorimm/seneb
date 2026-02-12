from fastapi import APIRouter, Depends, status, HTTPException
from typing import List, Any
from backend.core.database import db
from backend.core.configs import settings
from backend.schemas import ReportSchema, TransactionSchema
from backend.core.security import get_current_user
from backend.models.user_model import UserModel
from backend.repositories.report_repository import ReportRepository
from backend.repositories.transaction_repository import TransactionRepository

router = APIRouter()

def get_repos():
    if not db.client:
        raise HTTPException(status_code=500, detail="Database not connected")
    database = db.client.get_database(settings.DATABASE_NAME)
    return ReportRepository(database), TransactionRepository(database)

@router.get("/", response_model=List[ReportSchema])
async def list_reports(
    current_user: UserModel = Depends(get_current_user),
    repos: tuple = Depends(get_repos)
) -> Any:
    report_repo, _ = repos
    return await report_repo.list_all({"user_id": str(current_user.id)})

@router.get("/{report_id}/transactions", response_model=List[TransactionSchema])
async def get_report_details(
    report_id: str, 
    current_user: UserModel = Depends(get_current_user),
    repos: tuple = Depends(get_repos)
) -> Any:
    report_repo, transaction_repo = repos

    report = await report_repo.get_by_id(report_id)
    if not report or str(report.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")

    return await transaction_repo.get_by_report(str(current_user.id), report_id)

# --- CORREÇÃO AQUI: Mudamos '-> Any' para '-> None' ---
@router.delete("/{report_id}/reopen", status_code=status.HTTP_204_NO_CONTENT)
async def reopen_report(
    report_id: str,
    current_user: UserModel = Depends(get_current_user),
    repos: tuple = Depends(get_repos)
) -> None:
    """Exclui o relatório e volta transações para Draft"""
    report_repo, transaction_repo = repos

    report = await report_repo.get_by_id(report_id)
    if not report or str(report.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")

    await transaction_repo.revert_to_draft(str(current_user.id), report_id)
    await report_repo.delete(report_id)
    return None

# --- CORREÇÃO AQUI: Mudamos '-> Any' para '-> None' ---
@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report_permanently(
    report_id: str,
    current_user: UserModel = Depends(get_current_user),
    repos: tuple = Depends(get_repos)
) -> None:
    """Exclui relatório E transações"""
    report_repo, transaction_repo = repos

    report = await report_repo.get_by_id(report_id)
    if not report or str(report.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")

    await transaction_repo.delete_by_report(str(current_user.id), report_id)
    await report_repo.delete(report_id)
    return None