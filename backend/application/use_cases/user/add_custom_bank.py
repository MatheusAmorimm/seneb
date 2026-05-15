from backend.application.dtos.user_dtos import AddBankInput
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository


class AddCustomBankUseCase:
    def __init__(self, user_repo: IUserRepository) -> None:
        self._user_repo = user_repo

    async def execute(
        self,
        data: AddBankInput,
        current_user: UserEntity,
    ) -> dict:
        formatted = data.bank_name.strip().title()
        added = await self._user_repo.add_custom_bank(str(current_user.id), formatted)
        if not added:
            return {"message": f"O banco '{formatted}' já estava na sua lista.", "bank_name": formatted}
        return {"message": f"Banco '{formatted}' adicionado com sucesso.", "bank_name": formatted}
