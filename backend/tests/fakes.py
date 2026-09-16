"""Repositórios em memória para testes unitários dos casos de uso.

Implementam as mesmas interfaces dos repositórios Mongo, com a mesma
semântica de filtros, sem depender de banco.
"""

from datetime import date
from typing import Optional
from uuid import uuid4

from backend.domain.entities.analytics import (
    AnalyticsScope,
    AnalyticsTotals,
    BreakdownItem,
    MonthlyPoint,
    UpcomingDueItem,
)
from backend.domain.entities.group import GroupEntity, GroupMemberEntity
from backend.domain.entities.report import ReportEntity
from backend.domain.entities.transaction import TransactionEntity
from backend.domain.interfaces.analytics_repository import IAnalyticsRepository
from backend.domain.interfaces.group_repository import IGroupRepository
from backend.domain.interfaces.report_repository import IReportRepository
from backend.domain.interfaces.transaction_repository import ITransactionRepository


class FakeTransactionRepository(ITransactionRepository):
    def __init__(self, items: Optional[list[TransactionEntity]] = None) -> None:
        self.items: list[TransactionEntity] = list(items or [])

    def _drafts(self, user_id, group_id, reopened_report_id):
        out = []
        for t in self.items:
            if t.status != "draft":
                continue
            if group_id and t.group_id != group_id:
                continue
            if not group_id and (t.user_id != user_id or t.group_id):
                continue
            if t.report_id and t.report_id != reopened_report_id:
                continue
            out.append(t)
        return out

    async def find_drafts(self, user_id, group_id, reopened_report_id=None):
        return self._drafts(user_id, group_id, reopened_report_id)

    async def find_finalized_by_report(self, report_id):
        return [t for t in self.items if t.report_id == report_id and t.status == "finalized"]

    async def find_by_id(self, transaction_id):
        return next((t for t in self.items if t.id == transaction_id), None)

    async def create(self, transaction):
        transaction.id = transaction.id or str(uuid4())
        self.items.append(transaction)
        return transaction

    async def create_many(self, transactions):
        for t in transactions:
            await self.create(t)

    async def update(self, transaction_id, updates):
        t = await self.find_by_id(transaction_id)
        if not t:
            return None
        updated = t.model_copy(update=updates)
        self.items = [updated if x.id == transaction_id else x for x in self.items]
        return updated

    async def delete(self, transaction_id):
        before = len(self.items)
        self.items = [t for t in self.items if t.id != transaction_id]
        return len(self.items) < before

    async def finalize_drafts(self, user_id, group_id, report_id, reopened_report_id):
        for t in self._drafts(user_id, group_id, reopened_report_id):
            t.status = "finalized"
            t.report_id = report_id

    async def find_for_reopen(self, report_id):
        return [t for t in self.items if t.report_id == report_id]

    async def reopen_transactions(self, report_id):
        for t in self.items:
            if t.report_id == report_id:
                t.status = "draft"

    async def delete_by_report(self, report_id):
        self.items = [t for t in self.items if t.report_id != report_id]

    async def delete_draft_installment(self, user_id, group_id, description, installment_number):
        def matches(t: TransactionEntity) -> bool:
            if t.status != "draft" or t.report_id:
                return False
            if t.description != description or t.current_installment != installment_number:
                return False
            if group_id:
                return t.group_id == group_id
            return t.user_id == user_id and not t.group_id

        self.items = [t for t in self.items if not matches(t)]

    async def sum_goal_contributions(self, user_id):
        totals: dict[str, float] = {}
        for t in self.items:
            if t.type == "goal" and t.user_id == user_id and t.goal_id:
                totals[t.goal_id] = totals.get(t.goal_id, 0.0) + t.amount
        return totals

    async def sum_goal_contribution(self, goal_id):
        return sum(t.amount for t in self.items if t.type == "goal" and t.goal_id == goal_id)

    async def sum_goal_month(self, user_id, month_prefix):
        return sum(
            t.amount
            for t in self.items
            if t.type == "goal" and t.user_id == user_id and t.date.startswith(month_prefix)
        )


class FakeReportRepository(IReportRepository):
    def __init__(self) -> None:
        self.items: list[ReportEntity] = []

    async def create(self, report):
        self.items.append(report)
        return report

    async def find_by_user(self, user_id):
        return [r for r in self.items if r.user_id == user_id and not r.group_id]

    async def find_by_group(self, group_id):
        return [r for r in self.items if r.group_id == group_id]

    async def find_by_id(self, report_id):
        return next((r for r in self.items if r.id == report_id), None)

    async def name_exists(self, name, user_id, group_id):
        for r in self.items:
            if r.name != name:
                continue
            if group_id and r.group_id == group_id:
                return True
            if not group_id and r.user_id == user_id and not r.group_id:
                return True
        return False

    async def delete(self, report_id):
        self.items = [r for r in self.items if r.id != report_id]


class FakeGroupRepository(IGroupRepository):
    def __init__(self, groups: Optional[list[GroupEntity]] = None) -> None:
        self.items: list[GroupEntity] = list(groups or [])

    async def create(self, group):
        group.id = group.id or str(uuid4())
        self.items.append(group)
        return group

    async def find_by_id(self, group_id):
        return next((g for g in self.items if g.id == group_id), None)

    async def find_by_member(self, user_id):
        return [g for g in self.items if g.is_active and any(m.user_id == user_id for m in g.members)]

    async def add_member(self, group_id, member):
        (await self.find_by_id(group_id)).members.append(member)

    async def remove_member(self, group_id, user_id):
        g = await self.find_by_id(group_id)
        g.members = [m for m in g.members if m.user_id != user_id]

    async def soft_delete(self, group_id):
        (await self.find_by_id(group_id)).is_active = False

    async def is_member(self, group_id, user_id):
        g = await self.find_by_id(group_id)
        return bool(g and any(m.user_id == user_id for m in g.members))

    async def get_member_role(self, group_id, user_id):
        g = await self.find_by_id(group_id)
        if not g:
            return None
        return next((m.role for m in g.members if m.user_id == user_id), None)


def make_group(group_id: str, owner: str, members: dict[str, str]) -> GroupEntity:
    return GroupEntity(
        id=group_id,
        name=f"Grupo {group_id}",
        owner_id=owner,
        members=[GroupMemberEntity(user_id=u, role=r) for u, r in members.items()],
    )


class FakeAnalyticsRepository(IAnalyticsRepository):
    """Calcula em memória a partir de TransactionEntity, com a mesma semântica do Mongo."""

    def __init__(self, items: list[TransactionEntity]) -> None:
        self.items = items

    def _select(self, scope: AnalyticsScope, start: str, end: str, include_drafts: bool):
        for t in self.items:
            if scope.group_id and t.group_id != scope.group_id:
                continue
            if not scope.group_id and (t.user_id != scope.user_id or t.group_id):
                continue
            if not (start <= t.date <= end):
                continue
            if not include_drafts and t.status != "finalized":
                continue
            yield t

    async def totals(self, scope, start, end, include_drafts):
        sel = list(self._select(scope, start, end, include_drafts))
        return AnalyticsTotals.build(
            income=sum(t.effective_amount for t in sel if t.type == "income"),
            expense=sum(t.effective_amount for t in sel if t.type == "expense"),
            goal_saved=sum(t.effective_amount for t in sel if t.type == "goal"),
            transaction_count=len(sel),
        )

    async def breakdown(self, scope, start, end, include_drafts, dimension, kind):
        acc: dict[str, list[float]] = {}
        for t in self._select(scope, start, end, include_drafts):
            if t.type != kind:
                continue
            label = getattr(t, dimension) or "Não informado"
            acc.setdefault(label, [0.0, 0])
            acc[label][0] += t.effective_amount
            acc[label][1] += 1
        items = [BreakdownItem(label=k, total=v[0], count=int(v[1])) for k, v in acc.items()]
        return sorted(items, key=lambda i: i.total, reverse=True)

    async def monthly_totals(self, scope, start, end, include_drafts):
        acc: dict[str, dict[str, float]] = {}
        for t in self._select(scope, start, end, include_drafts):
            m = acc.setdefault(t.date[:7], {"income": 0.0, "expense": 0.0, "goal": 0.0})
            m[t.type] += t.effective_amount
        return [
            MonthlyPoint(
                month=k,
                income=v["income"],
                expense=v["expense"],
                goal_saved=v["goal"],
                balance=v["income"] - v["expense"],
            )
            for k, v in sorted(acc.items())
        ]

    async def upcoming_due(self, scope, start, end):
        out = []
        for t in self._select(scope, "0000-00-00", "9999-99-99", True):
            if t.status != "draft" or t.type != "expense" or not t.due_date:
                continue
            if not (start <= t.due_date <= end):
                continue
            days = (date.fromisoformat(t.due_date) - date.fromisoformat(start)).days
            out.append(
                UpcomingDueItem(
                    transaction_id=t.id,
                    description=t.description,
                    category=t.category,
                    subcategory=t.subcategory,
                    amount=t.effective_amount,
                    due_date=t.due_date,
                    days_left=days,
                    payment_method=t.payment_method,
                    bank=t.bank,
                )
            )
        return sorted(out, key=lambda i: i.due_date)
