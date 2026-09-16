from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.v1.dependencies import (
    get_current_user,
    get_goal_repo,
    get_group_repo,
    get_report_repo,
    get_transaction_repo,
)
from backend.application.dtos.transaction_dtos import (
    FinalizeInput,
    TransactionInput,
    TransactionOutput,
    TransactionUpdateInput,
)
from backend.application.use_cases.transaction.create_transaction import CreateTransactionUseCase
from backend.application.use_cases.transaction.delete_transaction import DeleteTransactionUseCase
from backend.application.use_cases.transaction.finalize_month import FinalizeMonthUseCase
from backend.application.use_cases.transaction.list_draft_transactions import (
    ListDraftTransactionsUseCase,
)
from backend.application.use_cases.transaction.update_transaction import UpdateTransactionUseCase
from backend.core.exceptions import (
    ConflictException,
    DomainException,
    ForbiddenException,
    NotFoundException,
)
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.goal_repository import IGoalRepository
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    if isinstance(exc, ForbiddenException):
        raise HTTPException(status_code=403, detail=exc.message)
    if isinstance(exc, ConflictException):
        raise HTTPException(status_code=409, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.get("/draft", response_model=list[TransactionOutput])
async def get_draft_transactions(
    group_id: Optional[str] = None,
    report_id: Optional[str] = None,
    current_user: UserEntity = Depends(get_current_user),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        entities = await ListDraftTransactionsUseCase(
            transaction_repo, group_repo
        ).execute(
            current_user_id=str(current_user.id),
            group_id=group_id,
            reopened_report_id=report_id,
        )
        return [TransactionOutput(**e.model_dump()) for e in entities]
    except DomainException as exc:
        _handle(exc)


@router.post("", response_model=TransactionOutput)
async def create_transaction(
    data: TransactionInput,
    current_user: UserEntity = Depends(get_current_user),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        entity = await CreateTransactionUseCase(transaction_repo, group_repo).execute(
            data, str(current_user.id)
        )
        return TransactionOutput(**entity.model_dump())
    except DomainException as exc:
        _handle(exc)


@router.put("/{transaction_id}", response_model=TransactionOutput)
async def update_transaction(
    transaction_id: str,
    data: TransactionUpdateInput,
    current_user: UserEntity = Depends(get_current_user),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        entity = await UpdateTransactionUseCase(transaction_repo, group_repo).execute(
            transaction_id, data, str(current_user.id)
        )
        return TransactionOutput(**entity.model_dump())
    except DomainException as exc:
        _handle(exc)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    current_user: UserEntity = Depends(get_current_user),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
    goal_repo: IGoalRepository = Depends(get_goal_repo),
):
    try:
        await DeleteTransactionUseCase(transaction_repo, group_repo, goal_repo).execute(
            transaction_id, str(current_user.id)
        )
    except DomainException as exc:
        _handle(exc)


@router.post("/finalize")
async def finalize_month(
    data: FinalizeInput,
    current_user: UserEntity = Depends(get_current_user),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
    report_repo: IReportRepository = Depends(get_report_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        report_id = await FinalizeMonthUseCase(
            transaction_repo, report_repo, group_repo
        ).execute(data, str(current_user.id))
        return {"message": "Mês finalizado com sucesso!", "report_id": report_id}
    except DomainException as exc:
        _handle(exc)
