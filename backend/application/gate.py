from backend.core.exceptions import DomainException


class Gate:
    """
    Validates preconditions before a use case executes.

    Pattern:
        gate = Gate()
        gate.require(condition, "message").require(condition2, "message2")
        gate.check()  # raises DomainException on first violation

    Use check_all() to surface every violation at once instead of just the first.
    """

    def __init__(self) -> None:
        self._violations: list[str] = []

    def require(self, condition: bool, message: str) -> "Gate":
        if not condition:
            self._violations.append(message)
        return self

    def check(self) -> None:
        if self._violations:
            raise DomainException(self._violations[0])

    def check_all(self) -> None:
        if self._violations:
            raise DomainException("; ".join(self._violations))
