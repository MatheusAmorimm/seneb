from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Any
from datetime import timedelta
import random

from backend.core.database import db
from backend.core.configs import settings
from backend.core.security import create_access_token, verify_password
from backend.core.mail import send_verification_code
from backend.schemas import UserCreate, UserSchema, Token
from backend.repositories.user_repository import UserRepository

router = APIRouter()

# --- SCHEMAS LOCAIS ---
class EmailSchema(BaseModel):
    email: EmailStr

class UserSignupRequest(BaseModel):
    full_name: str
    nickname: str | None = None
    email: EmailStr
    password: str
    confirm_password: str
    verification_code: str

# Injeção de Dependência
def get_user_repo() -> UserRepository:
    if not db.client:
        raise HTTPException(status_code=500, detail="Database not connected")
    return UserRepository(db.client.get_database(settings.DATABASE_NAME))

@router.post("/send-code")
async def send_code(data: EmailSchema):
    if not db.client:
        raise HTTPException(status_code=500, detail="Database error")
    
    code = str(random.randint(1000, 9999))
    try:
        # CORREÇÃO 1: Adicionado settings.DATABASE_NAME
        await db.client.get_database(settings.DATABASE_NAME)["verification_codes"].update_one(
            {"email": data.email},
            {"$set": {"code": code, "email": data.email}}, 
            upsert=True 
        )
        await send_verification_code(data.email, code)
        return {"message": "Código enviado com sucesso."}
    except Exception as e:
        print(f"Erro envio código: {e}")
        raise HTTPException(status_code=500, detail="Erro ao enviar código.")

@router.post("/signup", response_model=Any, status_code=status.HTTP_201_CREATED)
async def signup(
    user_req: UserSignupRequest,
    repo: UserRepository = Depends(get_user_repo)
):
    if not db.client: raise HTTPException(500, "DB Error")

    # 1. Valida Senha
    if user_req.password != user_req.confirm_password:
        raise HTTPException(status_code=400, detail="Senhas não conferem")

    # 2. Valida Código
    # CORREÇÃO 2: Adicionado settings.DATABASE_NAME
    code_doc = await db.client.get_database(settings.DATABASE_NAME)["verification_codes"].find_one({"email": user_req.email})
    
    if not code_doc or code_doc["code"] != user_req.verification_code:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

    # 3. Verifica existência
    existing = await repo.get_by_email(user_req.email)
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    # 4. Cria Usuário
    user_create = UserCreate(
        email=user_req.email,
        password=user_req.password,
        confirm_password=user_req.confirm_password,
        full_name=user_req.full_name,
        nickname=user_req.nickname
    )
    new_user = await repo.create(user_create)

    # 5. Gera Token (Auto-Login)
    access_token = create_access_token(
        data={"sub": str(new_user.id)}, 
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # 6. Limpa código
    # CORREÇÃO 3: Adicionado settings.DATABASE_NAME
    await db.client.get_database(settings.DATABASE_NAME)["verification_codes"].delete_one({"email": user_req.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": new_user.full_name,
        "user_nickname": new_user.nickname
    }

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    repo: UserRepository = Depends(get_user_repo)
) -> Any:
    # 1. Busca usuário
    user = await repo.get_by_email(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Credenciais inválidas.")

    # 2. Busca hash (Seguro)
    # Aqui usamos o repo.collection, que já tem o banco certo injetado no get_user_repo!
    user_doc = await repo.collection.find_one({"email": form_data.username})
    
    if not user_doc:
        raise HTTPException(status_code=400, detail="Credenciais inválidas.")
        
    hashed_pw = user_doc.get("hashed_password")

    if not hashed_pw or not verify_password(form_data.password, hashed_pw):
         raise HTTPException(status_code=400, detail="Credenciais inválidas.")

    # 3. Token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user 
    }