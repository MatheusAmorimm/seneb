from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from backend.core.configs import settings
from backend.core.database import db
from backend.core.security import get_current_user
from backend.models.user_model import UserModel
from backend.schemas import UserSchema, BankAdd
from backend.repositories.user_repository import UserRepository
from pydantic import BaseModel

router = APIRouter()

# Schema local para update parcial
class UserUpdateInput(BaseModel):
    full_name: str | None = None
    nickname: str | None = None

# Injeção de Dependência
def get_user_repo() -> UserRepository:
    if not db.client:
        raise HTTPException(status_code=500, detail="Database not connected")
    return UserRepository(db.client.get_database(settings.DATABASE_NAME))

@router.get("/me", response_model=UserSchema)
async def get_user_me(
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return current_user

@router.post("/banks", status_code=status.HTTP_201_CREATED)
async def add_custom_bank(
    bank: BankAdd,
    current_user: UserModel = Depends(get_current_user),
    repo: UserRepository = Depends(get_user_repo)
) -> Any:
    formatted_name = bank.bank_name.strip().title()
    if not formatted_name:
         raise HTTPException(status_code=400, detail="Nome do banco inválido.")
    
    # Usa o método novo do repositório
    was_added = await repo.add_custom_bank(str(current_user.id), formatted_name)
    
    msg = "Banco adicionado com sucesso." if was_added else "O banco já estava na sua lista."
    return {"message": msg, "bank_name": formatted_name}

@router.patch("/me", response_model=UserSchema)
async def update_user_me(
    user_data: UserUpdateInput,
    current_user: UserModel = Depends(get_current_user),
    repo: UserRepository = Depends(get_user_repo)
) -> Any:
    # O BaseRepository.update já faz a mágica do $set e trata ObjectIds
    updated_user = await repo.update(str(current_user.id), user_data)
    return updated_user