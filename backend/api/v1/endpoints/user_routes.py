from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from backend.core.database import db
from backend.core.security import get_current_user
from backend.models.user_model import UserModel
from backend.schemas import UserSchema, BankAdd

router = APIRouter()

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None

@router.get("/me", response_model=UserSchema)
async def get_user_me(current_user: UserModel = Depends(get_current_user)):
    """Retorna os dados do usuário logado, incluindo seus bancos personalizados."""
    return current_user

@router.post("/banks", status_code=status.HTTP_201_CREATED)
async def add_custom_bank(
    bank: BankAdd,
    current_user: UserModel = Depends(get_current_user)
):
    # 1. Normalização: Remove espaços e capitaliza cada palavra (Ex: "  nubank  " -> "Nubank")
    formatted_name = bank.bank_name.strip().title()
    
    if not formatted_name:
         raise HTTPException(status_code=400, detail="Nome do banco inválido.")
    
    try:
        user_id_obj = ObjectId(current_user.id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de usuário inválido.")

    # 2. $addToSet garante unicidade exata no banco
    result = await db.db.users.update_one(
        {"_id": user_id_obj},
        {"$addToSet": {"custom_banks": formatted_name}}
    )
    
    if result.modified_count == 0:
        return {"message": f"O banco '{formatted_name}' já estava na sua lista.", "bank_name": formatted_name}
        
    return {"message": f"Banco '{formatted_name}' adicionado com sucesso.", "bank_name": formatted_name}

@router.patch("/me", response_model=UserSchema)
async def update_user_me(
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    update_fields = {}
    
    if user_data.full_name:
        update_fields["full_name"] = user_data.full_name
    if user_data.nickname:
        update_fields["nickname"] = user_data.nickname
        
    if not update_fields:
        return current_user

    try:
        user_id_obj = ObjectId(current_user.id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido.")

    await db.db.users.update_one(
        {"_id": user_id_obj},
        {"$set": update_fields}
    )
    
    # Atualiza o objeto atual para retorno
    current_user_dict = current_user.model_dump()
    current_user_dict.update(update_fields)
    
    return current_user_dict