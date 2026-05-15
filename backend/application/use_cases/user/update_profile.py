from backend.application.dtos.user_dtos import UpdateProfileInput
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository


class UpdateProfileUseCase:
    def __init__(self, user_repo: IUserRepository) -> None:
        self._user_repo = user_repo

    async def execute(
        self,
        data: UpdateProfileInput,
        current_user: UserEntity,
    ) -> UserEntity:
        if not data.full_name and not data.nickname:
            return current_user

        updated = await self._user_repo.update_profile(
            user_id=str(current_user.id),
            full_name=data.full_name,
            nickname=data.nickname,
        )
        return updated or current_user
