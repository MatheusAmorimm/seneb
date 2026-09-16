import pytest

from backend.application.dtos.transaction_dtos import FinalizeInput
from backend.application.use_cases.transaction.finalize_month import FinalizeMonthUseCase
from backend.core.exceptions import ConflictException, DomainException
from backend.domain.entities.transaction import TransactionEntity
from tests.fakes import FakeGroupRepository, FakeReportRepository, FakeTransactionRepository


def _tx(**kw) -> TransactionEntity:
    base = dict(
        id=kw.pop("id", None),
        user_id="u1",
        amount=100.0,
        type="expense",
        category="Compras Pessoais",
        date="2026-09-05",
        status="draft",
    )
    base.update(kw)
    return TransactionEntity(**base)


def test_effective_amount_property():
    assert _tx(amount=1200.0, is_installment=True, total_installments=12).effective_amount == 100.0
    assert _tx(amount=300.0).effective_amount == 300.0
    assert _tx(amount=300.0, is_installment=True, total_installments=1).effective_amount == 300.0


async def test_report_totals_use_installment_value():
    tx_repo = FakeTransactionRepository([
        _tx(id="a", type="income", category="Receitas", amount=5000.0),
        _tx(id="b", amount=1200.0, is_installment=True, total_installments=12, current_installment=1),
        _tx(id="c", amount=250.0),
    ])
    report_repo = FakeReportRepository()
    use_case = FinalizeMonthUseCase(tx_repo, report_repo, FakeGroupRepository())

    report_id = await use_case.execute(
        FinalizeInput(report_name="Set 2026", reference_month="09/2026"), "u1"
    )

    report = await report_repo.find_by_id(report_id)
    assert report.total_income == 5000.0
    assert report.total_expense == 350.0
    assert report.balance == 4650.0

    # A próxima parcela projetada continua com o valor total (regra existente).
    drafts = [t for t in tx_repo.items if t.status == "draft"]
    assert len(drafts) == 1
    assert drafts[0].current_installment == 2
    assert drafts[0].amount == 1200.0
    assert drafts[0].installment_identifier == "2/12"


async def test_finalize_requires_drafts_and_unique_name():
    tx_repo = FakeTransactionRepository([])
    report_repo = FakeReportRepository()
    use_case = FinalizeMonthUseCase(tx_repo, report_repo, FakeGroupRepository())

    with pytest.raises(DomainException):
        await use_case.execute(FinalizeInput(report_name="Vazio", reference_month="09/2026"), "u1")

    tx_repo.items.append(_tx(id="x"))
    await use_case.execute(FinalizeInput(report_name="Set 2026", reference_month="09/2026"), "u1")

    tx_repo.items.append(_tx(id="y"))
    with pytest.raises(ConflictException):
        await use_case.execute(FinalizeInput(report_name="Set 2026", reference_month="09/2026"), "u1")
