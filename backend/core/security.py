from datetime import datetime, timedelta, timezone
from typing import Union, Annotated, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.core.configs import settings
from backend.core.database import db
from backend.models.user_model import UserModel

# Configuração do Hashing (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- CORREÇÃO 1: Definindo o oauth2_scheme ---
# Isso diz ao Swagger UI para usar o fluxo de senha na rota de login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        token_sub: Any = payload.get("sub")
        
        # Se for None, lançamos erro antes de tentar transformar em string
        if token_sub is None:
            raise credentials_exception
            
        # Agora é seguro converter para string
        user_id: str = str(token_sub)
            
    except JWTError:
        raise credentials_exception
    
    # Busca usuário no banco
    from bson import ObjectId
    try:
        user = await db.db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        # Se o ID não for um ObjectId válido
        raise credentials_exception
    
    if user is None:
        raise credentials_exception
        
    return UserModel(**user)