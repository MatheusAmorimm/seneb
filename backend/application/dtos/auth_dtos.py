from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from backend.application.policies.password_policy import validate_password_strength


class SendCodeInput(BaseModel):
    email: EmailStr


class SignupInput(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    nickname: Optional[str] = Field(None, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str
    verification_code: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)


class SignupOutput(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_name: str
    user_nickname: Optional[str] = None


class LoginOutput(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_name: str
    nickname: Optional[str] = None


class RefreshInput(BaseModel):
    refresh_token: str


class LogoutInput(BaseModel):
    refresh_token: str


class RefreshOutput(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ForgotPasswordInput(BaseModel):
    email: EmailStr


class ResetPasswordInput(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)
