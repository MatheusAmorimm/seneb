from fastapi import APIRouter, Depends, HTTPException, Response, status

from backend.api.v1.dependencies import (
    get_current_user,
    get_report_repo,
    get_transaction_repo,
)
from backend.application.dtos.report_dtos import ReportOutput
from backend.application.dtos.transaction_dtos import TransactionOutput
from backend.application.use_cases.report.delete_report import DeleteReportUseCase
from backend.application.use_cases.report.get_report_transactions import (
    GetReportTransactionsUseCase,
)
from backend.application.use_cases.report.list_reports import ListReportsUseCase
from backend.application.use_cases.report.reopen_report import ReopenReportUseCase
from backend.core.exceptions import DomainException, NotFoundException
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.get("", response_model=list[ReportOutput])
async def get_reports(
    current_user: UserEntity = Depends(get_current_user),
    report_repo: IReportRepository = Depends(get_report_repo),
):
    entities = await ListReportsUseCase(report_repo).execute(str(current_user.id))
    return [ReportOutput(**e.model_dump()) for e in entities]


@router.get("/{report_id}/transactions", response_model=list[TransactionOutput])
async def get_report_transactions(
    report_id: str,
    current_user: UserEntity = Depends(get_current_user),
    report_repo: IReportRepository = Depends(get_report_repo),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
):
    try:
        entities = await GetReportTransactionsUseCase(
            report_repo, transaction_repo
        ).execute(report_id, str(current_user.id))
        return [TransactionOutput(**e.model_dump()) for e in entities]
    except DomainException as exc:
        _handle(exc)


@router.delete("/{report_id}/reopen", status_code=status.HTTP_204_NO_CONTENT)
async def reopen_report(
    report_id: str,
    current_user: UserEntity = Depends(get_current_user),
    report_repo: IReportRepository = Depends(get_report_repo),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
):
    try:
        await ReopenReportUseCase(report_repo, transaction_repo).execute(
            report_id, str(current_user.id)
        )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except DomainException as exc:
        _handle(exc)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    current_user: UserEntity = Depends(get_current_user),
    report_repo: IReportRepository = Depends(get_report_repo),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
):
    try:
        await DeleteReportUseCase(report_repo, transaction_repo).execute(
            report_id, str(current_user.id)
        )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except DomainException as exc:
        _handle(exc)
