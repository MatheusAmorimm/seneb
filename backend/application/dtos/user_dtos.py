from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from backend.application.policies.password_policy import validate_password_strength


class UserOutput(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    nickname: Optional[str] = None
    created_at: Optional[datetime] = None
    custom_banks: list[str] = []


class UpdateProfileInput(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    nickname: Optional[str] = Field(None, max_length=50)


class AddBankInput(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=100)


class ChangePasswordInitInput(BaseModel):
    current_password: str


class ChangePasswordConfirmInput(BaseModel):
    code: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)


class ChangeEmailInitInput(BaseModel):
    current_password: str


class VerifyCodeInput(BaseModel):
    code: str


class SetNewEmailInput(BaseModel):
    new_email: EmailStr
