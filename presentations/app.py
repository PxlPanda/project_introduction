from fastapi import FastAPI, Path
from pydantic import BaseModel
from services.registration_service import UserService

app = FastAPI(title = "Service for PE in MISIS")

registration_service = UserService()


@app.get("/menu")
def start():
    return ("hello, that's menu")
@app.post("/login")
def auth() -> str:
    if ...:
        return ("Authorisation was successful")
    else: 
        return ("Authorisation failed")
    
@app.post("/signin")
async def register(email:str, password: str, name: str) -> str:
    print(await registration_service.get_user(email, password=password))
    if await registration_service.get_user(email, password=password) == None:
        await registration_service.put_user(email = email, password = password, name = name)
        return ("Registration was succussful")
    else:
        return ("Registration failed, user with this email is already registered")
@app.get("/table")
def get_table():
    print("table")
@app.post("/table/reserve_time")
def reserve_time():
    if ...:
        print("time succesfully reserved")
    else:
        print("time already reserved")