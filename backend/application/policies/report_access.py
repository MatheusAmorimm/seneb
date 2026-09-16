from backend.core.exceptions import ForbiddenException, NotFoundException
from backend.domain.entities.report import ReportEntity
from backend.domain.interfaces.group_repository import IGroupRepository

_NOT_FOUND = "Relatório não encontrado."


class ReportAccessPolicy:
    """Regra única de acesso a relatórios.

    - Pessoal: só o dono enxerga (respondemos 404 para não revelar existência).
    - Grupo: qualquer membro lê; apenas administradores alteram (reabrir/excluir).
    """

    def __init__(self, group_repo: IGroupRepository) -> None:
        self._group_repo = group_repo

    async def assert_can_view(self, report: ReportEntity, user_id: str) -> None:
        if report.group_id:
            if not await self._group_repo.is_member(report.group_id, user_id):
                raise ForbiddenException("Acesso negado ao grupo.")
        elif report.user_id != user_id:
            raise NotFoundException(_NOT_FOUND)

    async def assert_can_modify(self, report: ReportEntity, user_id: str) -> None:
        if report.group_id:
            role = await self._group_repo.get_member_role(report.group_id, user_id)
            if role is None:
                raise ForbiddenException("Acesso negado ao grupo.")
            if role == "guest":
                raise ForbiddenException("Apenas administradores podem alterar relatórios do grupo.")
        elif report.user_id != user_id:
            raise NotFoundException(_NOT_FOUND)
