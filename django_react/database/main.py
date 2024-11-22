# main.py

from fastapi import FastAPI
from services.authentification_service import AuthService
from services.registration_service import RegistrationService

app = FastAPI()

auth_service = AuthService()

@app.post("/login")
async def login(email: str, password: str):
    token = await auth_service.authenticate_user(email, password)
    if token is None:
        return {"error": "Invalid credentials"}
    return {"token": token}
