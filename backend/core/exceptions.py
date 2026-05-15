class DomainException(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundException(DomainException):
    pass


class ForbiddenException(DomainException):
    pass


class ConflictException(DomainException):
    pass


class UnauthorizedException(DomainException):
    pass
