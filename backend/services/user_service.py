from backend.repositories.user_repository import UserRepository
from backend.models.user_model import UserModel
from backend.schemas import UserCreate, UserLogin
from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.core.configs import settings
from datetime import timedelta

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def create_user(self, user_in: UserCreate) -> UserModel:
        # 1. VALIDAÇÃO NOVA: Senhas iguais?
        if user_in.password != user_in.confirm_password:
            raise ValueError("As senhas não coincidem") # O Frontend vai receber esse erro 400

        # 2. Email já existe?
        existing_user = await self.repository.get_by_email(user_in.email)
        if existing_user:
            raise ValueError("Email already registered")

        hashed_password = get_password_hash(user_in.password)

        new_user = UserModel(
            _id=None,
            email=user_in.email,
            password_hash=hashed_password,
            full_name=user_in.full_name,
            nickname=user_in.nickname
        )

        return await self.repository.create(new_user)

    async def authenticate(self, login_data: UserLogin):
        # ... (Mantenha o método authenticate igual ao anterior)
        # Vou repetir resumido aqui só para não perder contexto:
        user = await self.repository.get_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.password_hash):
            return None
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_name": user.full_name,
            "nickname": user.nickname
        }