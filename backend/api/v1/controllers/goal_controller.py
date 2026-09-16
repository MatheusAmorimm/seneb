from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.v1.dependencies import get_current_user, get_goal_repo, get_transaction_repo
from backend.application.dtos.goal_dtos import (
    GoalInput,
    GoalMonthlyTotalOutput,
    GoalOutput,
    GoalUpdateInput,
)
from backend.application.use_cases.goal.celebrate_goal import CelebrateGoalUseCase
from backend.application.use_cases.goal.create_goal import CreateGoalUseCase
from backend.application.use_cases.goal.delete_goal import DeleteGoalUseCase
from backend.application.use_cases.goal.get_monthly_total import GetGoalMonthlyTotalUseCase
from backend.application.use_cases.goal.list_goals import ListGoalsUseCase
from backend.application.use_cases.goal.update_goal import UpdateGoalUseCase
from backend.core.exceptions import DomainException, ForbiddenException, NotFoundException
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.goal_repository import IGoalRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    if isinstance(exc, ForbiddenException):
        raise HTTPException(status_code=403, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.get("", response_model=list[GoalOutput])
async def list_goals(
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: IGoalRepository = Depends(get_goal_repo),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
):
    return await ListGoalsUseCase(goal_repo, transaction_repo).execute(str(current_user.id))


@router.get("/monthly-total", response_model=GoalMonthlyTotalOutput)
async def get_monthly_total(
    current_user: UserEntity = Depends(get_current_user),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
):
    total = await GetGoalMonthlyTotalUseCase(transaction_repo).execute(str(current_user.id))
    return GoalMonthlyTotalOutput(total=total)


@router.post("", response_model=GoalOutput, status_code=status.HTTP_201_CREATED)
async def create_goal(
    data: GoalInput,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: IGoalRepository = Depends(get_goal_repo),
):
    return await CreateGoalUseCase(goal_repo).execute(data, str(current_user.id))


@router.put("/{goal_id}", response_model=GoalOutput)
async def update_goal(
    goal_id: str,
    data: GoalUpdateInput,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: IGoalRepository = Depends(get_goal_repo),
    transaction_repo: ITransactionRepository = Depends(get_transaction_repo),
):
    try:
        return await UpdateGoalUseCase(goal_repo, transaction_repo).execute(
            goal_id, data, str(current_user.id)
        )
    except DomainException as exc:
        _handle(exc)


@router.patch("/{goal_id}/celebrate", status_code=status.HTTP_204_NO_CONTENT)
async def celebrate_goal(
    goal_id: str,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: IGoalRepository = Depends(get_goal_repo),
):
    try:
        await CelebrateGoalUseCase(goal_repo).execute(goal_id, str(current_user.id))
    except DomainException as exc:
        _handle(exc)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: IGoalRepository = Depends(get_goal_repo),
):
    try:
        await DeleteGoalUseCase(goal_repo).execute(goal_id, str(current_user.id))
    except DomainException as exc:
        _handle(exc)
