from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.api.v1.dependencies import get_analytics_repo, get_current_user, get_group_repo
from backend.application.dtos.analytics_dtos import (
    BreakdownItemOutput,
    BreakdownOutput,
    MonthlyPointOutput,
    MonthlyTrendOutput,
    SummaryOutput,
    UpcomingDueItemOutput,
    UpcomingDueOutput,
)
from backend.application.use_cases.analytics.get_breakdown import GetBreakdownUseCase
from backend.application.use_cases.analytics.get_monthly_trend import GetMonthlyTrendUseCase
from backend.application.use_cases.analytics.get_summary import GetSummaryUseCase
from backend.application.use_cases.analytics.get_upcoming_due import GetUpcomingDueUseCase
from backend.core.exceptions import DomainException, ForbiddenException
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.analytics_repository import IAnalyticsRepository
from backend.domain.interfaces.group_repository import IGroupRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, ForbiddenException):
        raise HTTPException(status_code=403, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _default_period() -> tuple[str, str]:
    today = datetime.now(timezone.utc).date()
    return today.replace(day=1).isoformat(), today.isoformat()


@router.get("/summary", response_model=SummaryOutput)
async def get_summary(
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    group_id: Optional[str] = None,
    include_drafts: bool = True,
    current_user: UserEntity = Depends(get_current_user),
    repo: IAnalyticsRepository = Depends(get_analytics_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    start, end = (from_date, to_date) if from_date and to_date else _default_period()
    try:
        summary = await GetSummaryUseCase(repo, group_repo).execute(
            str(current_user.id), group_id, start, end, include_drafts
        )
        return SummaryOutput(**summary.model_dump())
    except DomainException as exc:
        _handle(exc)


@router.get("/breakdown", response_model=BreakdownOutput)
async def get_breakdown(
    dimension: str = "category",
    kind: str = "expense",
    limit: int = 10,
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    group_id: Optional[str] = None,
    include_drafts: bool = True,
    current_user: UserEntity = Depends(get_current_user),
    repo: IAnalyticsRepository = Depends(get_analytics_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    start, end = (from_date, to_date) if from_date and to_date else _default_period()
    try:
        total, items = await GetBreakdownUseCase(repo, group_repo).execute(
            str(current_user.id), group_id, start, end, include_drafts, dimension, kind, limit
        )
        return BreakdownOutput(
            dimension=dimension,
            kind=kind,
            total=total,
            items=[BreakdownItemOutput(**i.model_dump()) for i in items],
        )
    except DomainException as exc:
        _handle(exc)


@router.get("/monthly-trend", response_model=MonthlyTrendOutput)
async def get_monthly_trend(
    end: Optional[str] = None,
    months: int = 12,
    group_id: Optional[str] = None,
    include_drafts: bool = True,
    current_user: UserEntity = Depends(get_current_user),
    repo: IAnalyticsRepository = Depends(get_analytics_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        points = await GetMonthlyTrendUseCase(repo, group_repo).execute(
            str(current_user.id), group_id, end or _today(), months, include_drafts
        )
        return MonthlyTrendOutput(points=[MonthlyPointOutput(**p.model_dump()) for p in points])
    except DomainException as exc:
        _handle(exc)


@router.get("/upcoming-due", response_model=UpcomingDueOutput)
async def get_upcoming_due(
    from_date: Optional[str] = Query(None, alias="from"),
    days: int = 30,
    group_id: Optional[str] = None,
    current_user: UserEntity = Depends(get_current_user),
    repo: IAnalyticsRepository = Depends(get_analytics_repo),
    group_repo: IGroupRepository = Depends(get_group_repo),
):
    try:
        items = await GetUpcomingDueUseCase(repo, group_repo).execute(
            str(current_user.id), group_id, from_date or _today(), days
        )
        return UpcomingDueOutput(
            total=round(sum(i.amount for i in items), 2),
            items=[UpcomingDueItemOutput(**i.model_dump()) for i in items],
        )
    except DomainException as exc:
        _handle(exc)
