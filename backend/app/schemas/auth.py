import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_.-]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name", "username")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.lower()

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value) or not re.search(r"\d", value):
            raise ValueError("Password must contain at least one uppercase letter and one number")
        return value


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    message: str
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class PasswordResetVerifyResponse(BaseModel):
    message: str
    reset_token: str


class PasswordResetConfirmRequest(BaseModel):
    reset_token: str = Field(min_length=32, max_length=200)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value) or not re.search(r"\d", value):
            raise ValueError("Password must contain at least one uppercase letter and one number")
        return value


class AccountActionCodeRequest(BaseModel):
    action: Literal["change_password", "delete_account"]


class AccountActionVerifyRequest(AccountActionCodeRequest):
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class AccountActionVerifyResponse(BaseModel):
    message: str
    action_token: str


class AccountPasswordChangeRequest(BaseModel):
    action_token: str = Field(min_length=32, max_length=200)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value) or not re.search(r"\d", value):
            raise ValueError("Password must contain at least one uppercase letter and one number")
        return value


class AccountDeleteRequest(BaseModel):
    action_token: str = Field(min_length=32, max_length=200)
