from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from backend.schemas import UserCreate, UserSchema, UserLogin
from backend.core.database import db
from backend.repositories.user_repository import UserRepository
from backend.services.user_service import UserService
from backend.core.mail import send_verification_code
import random

router = APIRouter()

# --- SCHEMAS LOCAIS (Apenas para receber dados na rota) ---

class EmailSchema(BaseModel):
    email: EmailStr

# Renomeei para UserSignupRequest para não conflitar com o UserCreate do backend.schemas
class UserSignupRequest(BaseModel):
    full_name: str
    nickname: str | None = None
    email: EmailStr
    password: str
    confirm_password: str
    verification_code: str # Campo obrigatório para validar

# --- DEPENDÊNCIAS ---

def get_user_service():
    # Aqui você usa db.db, então mantivemos o padrão para o resto do arquivo
    repository = UserRepository(db.db)
    return UserService(repository)

# --- ROTAS ---

@router.post("/send-code")
async def send_code(data: EmailSchema):
    # 1. Gera código de 4 dígitos
    code = str(random.randint(1000, 9999))

    try:
        # 2. Salva no MongoDB (Usando db.db conforme seu padrão)
        # A coleção será criada automaticamente se não existir
        await db.db.verification_codes.update_one(
            {"email": data.email},
            {"$set": {"code": code, "email": data.email}}, 
            upsert=True 
        )

        # 3. Envia o e-mail real
        await send_verification_code(data.email, code)
        
        return {"message": "Código enviado com sucesso."}

    except Exception as e:
        print(f"Erro Mongo: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar envio.")

@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user_request: UserSignupRequest):
    # 1. Validação de Senha
    if user_request.password != user_request.confirm_password:
        raise HTTPException(status_code=400, detail="Senhas não conferem")

    # 2. BUSCA E VALIDA O CÓDIGO NO MONGODB
    stored_data = await db.db.verification_codes.find_one({"email": user_request.email})

    if not stored_data:
        raise HTTPException(status_code=400, detail="Nenhum código solicitado para este e-mail.")

    if stored_data["code"] != user_request.verification_code:
        raise HTTPException(status_code=400, detail="Código de verificação inválido.")

    # 3. Prepara os dados para o Service
    # Transformamos o UserSignupRequest (que tem código) no UserCreate (que o service espera)
    user_data = UserCreate(
        full_name=user_request.full_name,
        nickname=user_request.nickname,
        email=user_request.email,
        password=user_request.password,
        confirm_password=user_request.confirm_password
    )

    service = get_user_service()
    
    try:
        # 4. Cria o usuário no banco (O service já verifica se o email existe na tabela users)
        new_user = await service.create_user(user_data)
        
        # 5. Limpeza: Se deu tudo certo, apaga o código usado
        await db.db.verification_codes.delete_one({"email": user_request.email})
        
        return new_user

    except ValueError as e:
        # Captura erros do service (ex: email duplicado)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    service = get_user_service()
    
    user_login = UserLogin(email=form_data.username, password=form_data.password)
    
    auth_result = await service.authenticate(user_login)
    
    if not auth_result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return auth_result