from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth_schema import UserRegister, ForgotPasswordRequest
from app.services.auth_service import register_user, login_user, forgot_password_user

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


# 🔹 Forgot Password
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    return await forgot_password_user(data.email)
