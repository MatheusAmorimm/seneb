from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.goal import GoalEntity


class IGoalRepository(ABC):
    @abstractmethod
    async def create(self, goal: GoalEntity) -> GoalEntity: ...

    @abstractmethod
    async def find_by_user(self, user_id: str) -> list[GoalEntity]: ...

    @abstractmethod
    async def find_by_id(self, goal_id: str) -> Optional[GoalEntity]: ...

    @abstractmethod
    async def update(self, goal_id: str, updates: dict) -> Optional[GoalEntity]: ...

    @abstractmethod
    async def delete(self, goal_id: str) -> bool: ...
