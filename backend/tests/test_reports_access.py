import pytest

from backend.application.use_cases.report.delete_report import DeleteReportUseCase
from backend.application.use_cases.report.get_report_transactions import GetReportTransactionsUseCase
from backend.application.use_cases.report.list_reports import ListReportsUseCase
from backend.application.use_cases.report.reopen_report import ReopenReportUseCase
from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.report import ReportEntity
from backend.domain.entities.transaction import TransactionEntity
from tests.fakes import FakeGroupRepository, FakeReportRepository, FakeTransactionRepository, make_group


def _tx(tx_id, user_id, group_id, report_id, **kw):
    base = dict(
        id=tx_id, user_id=user_id, group_id=group_id, amount=10.0, type="expense",
        category="Moradia", date="2026-09-01", status="finalized", report_id=report_id,
    )
    base.update(kw)
    return TransactionEntity(**base)


def _setup():
    groups = FakeGroupRepository([
        make_group("g1", "owner", {"owner": "admin", "adm2": "admin", "guest": "guest"}),
    ])
    reports = FakeReportRepository()
    reports.items = [
        ReportEntity(id="r-personal", user_id="owner", name="Pessoal", reference_month="09/2026",
                     total_income=1, total_expense=0, balance=1),
        ReportEntity(id="r-group", user_id="owner", group_id="g1", name="Grupo", reference_month="09/2026",
                     total_income=1, total_expense=0, balance=1),
    ]
    tx = FakeTransactionRepository([
        _tx("t1", "owner", "g1", "r-group"),
        _tx("t2", "adm2", "g1", "r-group", amount=20.0),
        _tx("t3", "adm2", "g1", "r-group", amount=1200.0, description="TV", is_installment=True,
            total_installments=12, current_installment=1),
        # parcela seguinte projetada ao finalizar (rascunho, sem relatório), criada por adm2
        _tx("t3-next", "adm2", "g1", None, amount=1200.0, description="TV", is_installment=True,
            total_installments=12, current_installment=2, status="draft"),
        _tx("p1", "owner", None, "r-personal"),
    ])
    return groups, reports, tx


async def test_list_personal_excludes_group_reports():
    groups, reports, _ = _setup()
    result = await ListReportsUseCase(reports, groups).execute("owner", None)
    assert [r.id for r in result] == ["r-personal"]


async def test_list_group_visible_to_any_member_only():
    groups, reports, _ = _setup()
    result = await ListReportsUseCase(reports, groups).execute("guest", "g1")
    assert [r.id for r in result] == ["r-group"]
    with pytest.raises(ForbiddenException):
        await ListReportsUseCase(reports, groups).execute("stranger", "g1")


async def test_group_report_transactions_include_all_creators():
    groups, reports, tx = _setup()
    items = await GetReportTransactionsUseCase(reports, tx, groups).execute("r-group", "adm2")
    assert sorted(t.id for t in items) == ["t1", "t2", "t3"]


async def test_personal_report_hidden_from_others_with_404():
    groups, reports, tx = _setup()
    with pytest.raises(NotFoundException):
        await GetReportTransactionsUseCase(reports, tx, groups).execute("r-personal", "adm2")


async def test_guest_cannot_reopen_or_delete_group_report():
    groups, reports, tx = _setup()
    with pytest.raises(ForbiddenException):
        await ReopenReportUseCase(reports, tx, groups).execute("r-group", "guest")
    with pytest.raises(ForbiddenException):
        await DeleteReportUseCase(reports, tx, groups).execute("r-group", "guest")
    with pytest.raises(NotFoundException):
        await ReopenReportUseCase(reports, tx, groups).execute("r-personal", "stranger")


async def test_other_admin_can_reopen_group_report_and_next_installment_is_removed():
    groups, reports, tx = _setup()
    await ReopenReportUseCase(reports, tx, groups).execute("r-group", "owner")

    assert await reports.find_by_id("r-group") is None
    ids = {t.id: t for t in tx.items}
    assert "t3-next" not in ids                      # parcela projetada removida
    assert ids["t3"].status == "draft"               # itens voltaram a rascunho
    assert ids["t1"].status == "draft"
    assert ids["p1"].status == "finalized"           # relatório pessoal intacto
