from pydantic import BaseModel, EmailStr, Field


# 🔹 Register Schema
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


# 🔹 Login Schema (Optional, not used with OAuth2 form)
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 🔹 Forgot Password Schema
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

