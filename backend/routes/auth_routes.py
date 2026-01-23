from fastapi import APIRouter, HTTPException, status
from backend import schemas
from backend.core.database import db
from backend.core.configs import get_settings
from backend.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)  # Importe a nova função
from datetime import timedelta

settings = get_settings()
router = APIRouter()


@router.post(
    "/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user: schemas.UserCreate):
    """
    Cria um novo usuário no sistema.
    """
    # 1. Validação de Senha
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="As senhas não coincidem."
        )

    # 2. Verificar se e-mail já existe no Mongo
    # Acessamos a collection 'users' dentro do banco configurado
    existing_user = await db.client[settings.DATABASE_NAME]["users"].find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado.",
        )

    # 3. Preparar documento para salvar
    user_dict = user.model_dump()

    # Removemos a confirmação de senha e a senha pura
    del user_dict["confirm_password"]

    # Criptografa a senha antes de salvar
    hashed = get_password_hash(user_dict["password"])
    user_dict["password"] = hashed

    # Campos adicionais de controle
    user_dict["is_active"] = (
        True  # Por enquanto True, depois mudamos para False até confirmar e-mail
    )

    # 4. Inserir no Banco
    new_user = await db.client[settings.DATABASE_NAME]["users"].insert_one(user_dict)

    # 5. Retornar resposta (convertendo o _id do Mongo para string)
    created_user = await db.client[settings.DATABASE_NAME]["users"].find_one(
        {"_id": new_user.inserted_id}
    )

    # Truque para o Pydantic ler o _id como id
    created_user["id"] = str(created_user["_id"])

    return created_user


@router.post("/login")
async def login(user_data: schemas.UserLogin):
    """
    Recebe Email e Senha.
    Retorna o Token de Acesso se estiver correto.
    """
    # 1. Buscar usuário no banco pelo email
    user = await db.client[settings.DATABASE_NAME]["users"].find_one(
        {"email": user_data.email}
    )

    # 2. Se não achar o usuário OU a senha estiver errada -> Erro genérico (segurança)
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Se passou, criar o token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},  # Guardamos o ID do usuário dentro do token
        expires_delta=access_token_expires,
    )

    # 4. Retornar o token e o tipo
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user[
            "full_name"
        ],  # Opcional: Ajuda o frontend a mostrar "Olá, Matheus"
    }
