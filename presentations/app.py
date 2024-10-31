from fastapi import FastAPI, Path
from pydantic import BaseModel
from services.registration_service import UserService

app = FastAPI(title = "Service for PE in MISIS")

registration_service = UserService()

@app.post("/login")
def reg() -> str:
    if ...:
        return ("Registration was succesful")
    else: 
        return ("Registration failed")
@app.get("/table")
def get_table():
    print("table")
@app.post("/table/reserve_time")
def reserve_time():
    if ...:
        print("time succesfully reserved")
    else:
        print("time already reserved")