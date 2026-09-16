import pytest

from backend.application.use_cases.goal.list_goals import ListGoalsUseCase
from backend.application.use_cases.goal.update_goal import UpdateGoalUseCase
from backend.application.dtos.goal_dtos import GoalUpdateInput
from backend.core.exceptions import ForbiddenException
from backend.domain.entities.goal import GoalEntity
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.goal_repository import IGoalRepository
from tests.fakes import FakeTransactionRepository


class FakeGoalRepository(IGoalRepository):
    def __init__(self, goals: list[GoalEntity]) -> None:
        self.goals = goals

    async def create(self, goal):
        self.goals.append(goal)
        return goal

    async def find_by_user(self, user_id):
        return [g for g in self.goals if g.user_id == user_id]

    async def find_by_id(self, goal_id):
        return next((g for g in self.goals if g.id == goal_id), None)

    async def update(self, goal_id, updates):
        g = await self.find_by_id(goal_id)
        for k, v in updates.items():
            setattr(g, k, v)
        return g

    async def delete(self, goal_id):
        self.goals = [g for g in self.goals if g.id != goal_id]
        return True


def _goal_tx(tx_id: str, goal_id: str, amount: float, user_id: str = "u1") -> TransactionEntity:
    return TransactionEntity(
        id=tx_id, user_id=user_id, amount=amount, type="goal", category="Meta",
        date="2026-09-01", goal_id=goal_id,
    )


def _repos():
    goals = FakeGoalRepository([
        GoalEntity(id="g1", user_id="u1", name="Viagem", target_amount=1000.0, deadline="2027-01-01"),
        GoalEntity(id="g2", user_id="u1", name="Carro", target_amount=5000.0, deadline="2027-01-01"),
    ])
    tx = FakeTransactionRepository([
        _goal_tx("t1", "g1", 200.0),
        _goal_tx("t2", "g1", 300.0),
        _goal_tx("t3", "g9", 999.0, user_id="u2"),
    ])
    return goals, tx


async def test_list_goals_sums_contributions_in_one_pass():
    goals, tx = _repos()
    result = await ListGoalsUseCase(goals, tx).execute("u1")
    by_id = {g.id: g for g in result}
    assert by_id["g1"].current_amount == 500.0
    assert by_id["g2"].current_amount == 0.0


async def test_update_goal_returns_current_amount_and_checks_owner():
    goals, tx = _repos()
    updated = await UpdateGoalUseCase(goals, tx).execute("g1", GoalUpdateInput(name="Europa"), "u1")
    assert updated.name == "Europa"
    assert updated.current_amount == 500.0

    with pytest.raises(ForbiddenException):
        await UpdateGoalUseCase(goals, tx).execute("g1", GoalUpdateInput(name="X"), "u2")
