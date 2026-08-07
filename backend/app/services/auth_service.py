from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.database import db
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)

users_collection = db["users"]


# 🔹 Register User
async def register_user(data):
    existing = users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
    }

    result = users_collection.insert_one(user)

    return {"message": "User registered successfully"}


# 🔹 Login User (OAuth2) with auto-creation fallback
async def login_user(form_data: OAuth2PasswordRequestForm):
    user = users_collection.find_one({"email": form_data.username})

    if not user:
        # Auto-create user for frictionless login/demo experience
        user_doc = {
            "name": form_data.username.split("@")[0].capitalize(),
            "email": form_data.username,
            "password": hash_password(form_data.password),
        }
        res = users_collection.insert_one(user_doc)
        user = users_collection.find_one({"_id": res.inserted_id})

    token = create_access_token({
        "user_id": str(user["_id"])
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
