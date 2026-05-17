from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.api.v1.dependencies import get_current_user, get_db
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
from backend.infrastructure.repositories.mongo_goal_repository import MongoGoalRepository

router = APIRouter()


def _get_goal_repo(db: AsyncIOMotorDatabase = Depends(get_db)) -> MongoGoalRepository:
    return MongoGoalRepository(db)


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    if isinstance(exc, ForbiddenException):
        raise HTTPException(status_code=403, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.get("", response_model=list[GoalOutput])
async def list_goals(
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: MongoGoalRepository = Depends(_get_goal_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    return await ListGoalsUseCase(goal_repo, db).execute(str(current_user.id))


@router.get("/monthly-total", response_model=GoalMonthlyTotalOutput)
async def get_monthly_total(
    current_user: UserEntity = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    total = await GetGoalMonthlyTotalUseCase(db).execute(str(current_user.id))
    return GoalMonthlyTotalOutput(total=total)


@router.post("", response_model=GoalOutput, status_code=status.HTTP_201_CREATED)
async def create_goal(
    data: GoalInput,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: MongoGoalRepository = Depends(_get_goal_repo),
):
    return await CreateGoalUseCase(goal_repo).execute(data, str(current_user.id))


@router.put("/{goal_id}", response_model=GoalOutput)
async def update_goal(
    goal_id: str,
    data: GoalUpdateInput,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: MongoGoalRepository = Depends(_get_goal_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        return await UpdateGoalUseCase(goal_repo, db).execute(goal_id, data, str(current_user.id))
    except DomainException as exc:
        _handle(exc)


@router.patch("/{goal_id}/celebrate", status_code=status.HTTP_204_NO_CONTENT)
async def celebrate_goal(
    goal_id: str,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: MongoGoalRepository = Depends(_get_goal_repo),
):
    try:
        await CelebrateGoalUseCase(goal_repo).execute(goal_id, str(current_user.id))
    except DomainException as exc:
        _handle(exc)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    current_user: UserEntity = Depends(get_current_user),
    goal_repo: MongoGoalRepository = Depends(_get_goal_repo),
):
    try:
        await DeleteGoalUseCase(goal_repo).execute(goal_id, str(current_user.id))
    except DomainException as exc:
        _handle(exc)
