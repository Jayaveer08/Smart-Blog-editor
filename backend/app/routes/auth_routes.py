from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth_schema import UserRegister, ForgotPasswordRequest
from app.services.auth_service import register_user, login_user, forgot_password_user, check_email_exists, reset_password_direct
from pydantic import BaseModel, EmailStr

class DirectResetRequest(BaseModel):
    email: EmailStr
    new_password: str

class EmailCheckRequest(BaseModel):
    email: EmailStr

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


# 🔹 Register
@router.post("/register")
async def register(data: UserRegister):
    return await register_user(data)


# 🔹 Login
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return await login_user(form_data)


# 🔹 Forgot Password (email-based)
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    return await forgot_password_user(data.email)


# 🔹 Check Email Exists
@router.post("/check-email")
async def check_email(data: EmailCheckRequest):
    return await check_email_exists(data.email)


# 🔹 Direct Password Reset (no email required)
@router.post("/reset-password-direct")
async def reset_password_direct_route(data: DirectResetRequest):
    return await reset_password_direct(data.email, data.new_password)
