"""Utilitários de período usados pelos casos de uso de análise.

Datas são strings ISO (YYYY-MM-DD), o mesmo formato guardado em
`transactions.date`, o que permite comparação lexicográfica no Mongo.
"""

from datetime import date, timedelta

from backend.core.exceptions import DomainException
from backend.domain.entities.analytics import PeriodRange

MAX_PERIOD_DAYS = 366 * 3


def parse_ymd(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise DomainException(f"Data inválida: {value!r}. Use o formato YYYY-MM-DD.")


def to_ymd(value: date) -> str:
    return value.isoformat()


def validate_range(start: str, end: str) -> tuple[date, date]:
    s, e = parse_ymd(start), parse_ymd(end)
    if s > e:
        raise DomainException("A data inicial deve ser anterior ou igual à final.")
    if (e - s).days > MAX_PERIOD_DAYS:
        raise DomainException("Período máximo de 3 anos.")
    return s, e


def previous_range(start: str, end: str) -> PeriodRange:
    """Período imediatamente anterior, com a mesma duração em dias."""
    s, e = validate_range(start, end)
    length = (e - s).days + 1
    prev_end = s - timedelta(days=1)
    prev_start = prev_end - timedelta(days=length - 1)
    return PeriodRange(start=to_ymd(prev_start), end=to_ymd(prev_end))


def first_day_of_month(value: date) -> date:
    return value.replace(day=1)


def month_sequence(end: str, months: int) -> list[str]:
    """Lista de `months` meses (YYYY-MM) terminando no mês de `end`, em ordem crescente."""
    e = first_day_of_month(parse_ymd(end))
    out: list[str] = []
    year, month = e.year, e.month
    for _ in range(months):
        out.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(out))
