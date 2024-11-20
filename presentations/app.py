from fastapi import FastAPI, Path
from pydantic import BaseModel
from services.registration_service import UserService
from services.table_service import TableService
from services.autentification_service import Autent

app = FastAPI(title = "Service for PE in MISIS")

registration_service = UserService()

table_service = TableService()

@app.get("/menu")
def start():
    return ("hello, that's menu")
@app.post("/login")
async def auth(email:str, password:str) -> str:
    if registration_service.get_user(email = email, password = password) != None:
        #return registration_service.get_user(email = email, password = password)["input"]
        answer = str(await registration_service.get_user(email = email, password = password))
        return answer
    else: 
        return "fuck up"
    
@app.post("/signin")
async def register(email:str, password: str, name: str) -> str:
    is_in = await registration_service.get_user(email = email, password=password)
    if is_in == None:
        task = await registration_service.put_user(email = email, password = password, name = name)
        return ("Registration was succussful")
    else:
        return ("Registration failed, user with this email is already registered")
@app.get("/get_busy_time")
async def get_busy_time(uuid):
    return await table_service.get_busy_time(uuid= uuid)
@app.post("/table/reserve_time")
async def reserve_time(time, uuid):
    await table_service.put_time(time = time, uuid = uuid)
    return ("time successfuly reserved!") 
@app.get("/token_check")
def check_token(request, authorization_header):
    Autent.check_token(request, authorization_header)
@app.post("/create_token")
def create_token(id):
    Autent.create_token(id)