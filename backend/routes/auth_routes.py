from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from backend.schemas import UserCreate, UserSchema, UserLogin
from backend.core.database import db
from backend.repositories.user_repository import UserRepository
from backend.services.user_service import UserService

router = APIRouter()

def get_user_service():
    repository = UserRepository(db.db)
    return UserService(repository)

@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    service = get_user_service()
    try:
        return await service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # O FastAPI injeta user/senha no 'form_data' automaticamente
    service = get_user_service()
    
    # Adaptamos para o nosso Schema
    user_login = UserLogin(email=form_data.username, password=form_data.password)
    
    auth_result = await service.authenticate(user_login)
    
    if not auth_result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return auth_result