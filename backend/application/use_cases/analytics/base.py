from typing import Optional

from backend.core.exceptions import ForbiddenException
from backend.domain.entities.analytics import AnalyticsScope
from backend.domain.interfaces.analytics_repository import IAnalyticsRepository
from backend.domain.interfaces.group_repository import IGroupRepository


class ScopedAnalyticsUseCase:
    """Base dos casos de uso de análise: resolve e autoriza o escopo."""

    def __init__(self, repo: IAnalyticsRepository, group_repo: IGroupRepository) -> None:
        self._repo = repo
        self._group_repo = group_repo

    async def _scope(self, user_id: str, group_id: Optional[str]) -> AnalyticsScope:
        if group_id and not await self._group_repo.is_member(group_id, user_id):
            raise ForbiddenException("Acesso negado ao grupo.")
        return AnalyticsScope(user_id=user_id, group_id=group_id or None)
