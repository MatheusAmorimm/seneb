from abc import ABC, abstractmethod
from typing import Optional

from backend.domain.entities.transaction import TransactionEntity


class ITransactionRepository(ABC):
    @abstractmethod
    async def find_drafts(
        self,
        user_id: Optional[str],
        group_id: Optional[str],
        reopened_report_id: Optional[str] = None,
    ) -> list[TransactionEntity]: ...

    @abstractmethod
    async def find_finalized_by_report(
        self,
        report_id: str,
        user_id: str,
    ) -> list[TransactionEntity]: ...

    @abstractmethod
    async def find_by_id(self, transaction_id: str) -> Optional[TransactionEntity]: ...

    @abstractmethod
    async def create(self, transaction: TransactionEntity) -> TransactionEntity: ...

    @abstractmethod
    async def create_many(self, transactions: list[TransactionEntity]) -> None: ...

    @abstractmethod
    async def update(
        self,
        transaction_id: str,
        updates: dict,
    ) -> Optional[TransactionEntity]: ...

    @abstractmethod
    async def delete(self, transaction_id: str) -> bool: ...

    @abstractmethod
    async def finalize_drafts(
        self,
        user_id: Optional[str],
        group_id: Optional[str],
        report_id: str,
        reopened_report_id: Optional[str],
    ) -> None: ...

    @abstractmethod
    async def find_for_reopen(
        self,
        report_id: str,
        user_id: str,
    ) -> list[TransactionEntity]: ...

    @abstractmethod
    async def reopen_transactions(self, report_id: str, user_id: str) -> None: ...

    @abstractmethod
    async def delete_by_report(self, report_id: str, user_id: str) -> None: ...

    @abstractmethod
    async def delete_draft_installment(
        self,
        user_id: str,
        description: str,
        installment_number: int,
    ) -> None: ...
