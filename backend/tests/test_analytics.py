import pytest

from backend.application.use_cases.analytics.get_breakdown import GetBreakdownUseCase
from backend.application.use_cases.analytics.get_monthly_trend import GetMonthlyTrendUseCase
from backend.application.use_cases.analytics.get_summary import GetSummaryUseCase
from backend.application.use_cases.analytics.get_upcoming_due import GetUpcomingDueUseCase
from backend.application.use_cases.analytics.periods import month_sequence, previous_range
from backend.core.exceptions import DomainException, ForbiddenException
from backend.domain.entities.transaction import TransactionEntity
from tests.fakes import FakeAnalyticsRepository, FakeGroupRepository, make_group


def _tx(**kw) -> TransactionEntity:
    base = dict(
        id=kw.pop("id", "x"), user_id="u1", amount=100.0, type="expense",
        category="Alimentação", subcategory="Supermercado", date="2026-09-10", status="draft",
    )
    base.update(kw)
    return TransactionEntity(**base)


ITEMS = [
    _tx(id="1", type="income", category="Receitas", subcategory="Salário", amount=4000.0),
    _tx(id="2", amount=600.0, payment_method="credit_card"),
    _tx(id="3", category="Moradia", subcategory="Aluguel / financiamento", amount=1500.0,
        payment_method="pix", due_date="2026-09-20"),
    _tx(id="4", amount=1200.0, is_installment=True, total_installments=12,
        category="Compras Pessoais", subcategory="Eletrônicos"),
    _tx(id="5", type="goal", category="Meta", subcategory=None, amount=300.0, goal_id="g1"),
    _tx(id="6", date="2026-08-15", amount=900.0, status="finalized", report_id="r1"),
    _tx(id="7", date="2026-08-15", type="income", category="Receitas", amount=3000.0,
        status="finalized", report_id="r1"),
    _tx(id="8", user_id="u2", amount=50.0),
    _tx(id="9", user_id="u1", group_id="g1", amount=70.0),
]


def _deps():
    repo = FakeAnalyticsRepository(ITEMS)
    groups = FakeGroupRepository([make_group("g1", "u1", {"u1": "admin", "u3": "guest"})])
    return repo, groups


def test_periods_helpers():
    prev = previous_range("2026-09-01", "2026-09-30")
    assert (prev.start, prev.end) == ("2026-08-02", "2026-08-31")
    assert month_sequence("2026-09-15", 3) == ["2026-07", "2026-08", "2026-09"]
    assert month_sequence("2026-01-31", 2) == ["2025-12", "2026-01"]


async def test_summary_personal_with_previous_and_delta():
    repo, groups = _deps()
    s = await GetSummaryUseCase(repo, groups).execute("u1", None, "2026-09-01", "2026-09-30", True)

    assert s.current.income == 4000.0
    assert s.current.expense == 2200.0  # 600 + 1500 + 100 (parcela de 1200/12)
    assert s.current.goal_saved == 300.0
    assert s.current.balance == 1800.0
    assert s.current.savings_rate == 0.45
    assert s.current.transaction_count == 5

    assert s.previous_period.start == "2026-08-02"
    assert s.previous.income == 3000.0 and s.previous.expense == 900.0
    assert s.delta_pct["income"] == pytest.approx(33.33, abs=0.01)
    assert s.delta_pct["goal_saved"] is None  # anterior era zero: sem base


async def test_summary_excludes_drafts_when_asked():
    repo, groups = _deps()
    s = await GetSummaryUseCase(repo, groups).execute("u1", None, "2026-08-01", "2026-09-30", False)
    assert s.current.income == 3000.0 and s.current.expense == 900.0


async def test_summary_rejects_bad_period_and_stranger_group():
    repo, groups = _deps()
    with pytest.raises(DomainException):
        await GetSummaryUseCase(repo, groups).execute("u1", None, "2026-09-30", "2026-09-01", True)
    with pytest.raises(DomainException):
        await GetSummaryUseCase(repo, groups).execute("u1", None, "2026/09/01", "2026-09-30", True)
    with pytest.raises(ForbiddenException):
        await GetSummaryUseCase(repo, groups).execute("u2", "g1", "2026-09-01", "2026-09-30", True)


async def test_summary_group_scope_only_group_items():
    repo, groups = _deps()
    s = await GetSummaryUseCase(repo, groups).execute("u3", "g1", "2026-09-01", "2026-09-30", True)
    assert s.current.expense == 70.0 and s.current.income == 0.0


async def test_breakdown_shares_and_limit():
    repo, groups = _deps()
    total, items = await GetBreakdownUseCase(repo, groups).execute(
        "u1", None, "2026-09-01", "2026-09-30", True, "category", "expense", 2
    )
    assert total == 2200.0
    assert [i.label for i in items] == ["Moradia", "Alimentação"]
    assert items[0].share == pytest.approx(1500 / 2200, abs=1e-4)

    _, by_payment = await GetBreakdownUseCase(repo, groups).execute(
        "u1", None, "2026-09-01", "2026-09-30", True, "payment_method", "expense", 10
    )
    assert {i.label for i in by_payment} == {"pix", "credit_card", "Não informado"}

    with pytest.raises(DomainException):
        await GetBreakdownUseCase(repo, groups).execute(
            "u1", None, "2026-09-01", "2026-09-30", True, "user_id", "expense", 5
        )
    with pytest.raises(DomainException):
        await GetBreakdownUseCase(repo, groups).execute(
            "u1", None, "2026-09-01", "2026-09-30", True, "category", "expense", 0
        )


async def test_monthly_trend_fills_missing_months():
    repo, groups = _deps()
    pts = await GetMonthlyTrendUseCase(repo, groups).execute("u1", None, "2026-09-30", 4, True)
    assert [p.month for p in pts] == ["2026-06", "2026-07", "2026-08", "2026-09"]
    assert pts[0].income == 0.0 and pts[0].expense == 0.0
    assert pts[2].income == 3000.0 and pts[2].balance == 2100.0
    assert pts[3].expense == 2200.0 and pts[3].goal_saved == 300.0

    with pytest.raises(DomainException):
        await GetMonthlyTrendUseCase(repo, groups).execute("u1", None, "2026-09-30", 0, True)


async def test_upcoming_due():
    repo, groups = _deps()
    items = await GetUpcomingDueUseCase(repo, groups).execute("u1", None, "2026-09-11", 30)
    assert len(items) == 1
    assert items[0].transaction_id == "3"
    assert items[0].days_left == 9
    assert items[0].amount == 1500.0

    with pytest.raises(DomainException):
        await GetUpcomingDueUseCase(repo, groups).execute("u1", None, "2026-09-11", 0)
