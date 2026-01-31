from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Any 
import uuid
from backend.schemas import TransactionCreate, TransactionSchema
from backend.core.database import db
from backend.api.deps import get_current_user
from datetime import datetime, timezone
from pymongo import ReturnDocument

router = APIRouter()

# --- ROTAS ---
@router.post("/", response_model=TransactionSchema)
async def create_transaction(transaction: TransactionSchema,
                             current_user: Dict[str, Any] = Depends(get_current_user)):
    new_transaction = transaction.model_dump()
    
    new_transaction["_id"] = str(uuid.uuid4())
    new_transaction["created_at_system"] = datetime.now(timezone.utc)
    new_transaction["user_id"] = current_user["_id"]
    new_transaction["is_archived"] = False

    if new_transaction.get("is_installment") and not new_transaction.get("installment_current"):
        new_transaction["installment_current"] = 2

    await db.db["transactions"].insert_one(new_transaction)

    new_transaction["id"] = new_transaction["_id"]
    
    return new_transaction

@router.get("/", response_model=List[TransactionSchema])
async def get_transactions(
    current_user: Dict[str, Any] = Depends(get_current_user)):
    cursor = db.db["transactions"].find({"user_id": str(current_user["_id"])})

    results = []

    async for trans in cursor:
        trans["id"] = str(trans["_id"])
        results.append(trans)

    return results


@router.put("/{transaction_id}", response_model=TransactionSchema)
async def update_transaction(
    transaction_id: str, 
    transaction: TransactionCreate, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    update_data = transaction.model_dump()
    updated_transaction = await db.db["transactions"].find_one_and_update(
        {"_id": transaction_id, "user_id": str(current_user["_id"])},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )

    if not updated_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    updated_transaction["id"] = str(updated_transaction["_id"])
    return updated_transaction

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    delete_result = await db.db["transactions"].delete_one({
        "_id": transaction_id, 
        "user_id": str(current_user["_id"])
    })
    
    if delete_result.deleted_count == 1:
        return {"message": "Transação deletada com sucesso"}
    
    raise HTTPException(status_code=404, detail="Transação não encontrada")