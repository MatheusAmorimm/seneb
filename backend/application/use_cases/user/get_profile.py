from backend.domain.entities.user import UserEntity


class GetProfileUseCase:
    async def execute(self, current_user: UserEntity) -> UserEntity:
        return current_user
