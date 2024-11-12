from fastapi import FastAPI, Path
from pydantic import BaseModel
from services.registration_service import UserService
from services.table_service import TableService


app = FastAPI(title = "Service for PE in MISIS")

registration_service = UserService()

table_service = TableService()

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
    is_in = await registration_service.get_user(email = email, password=password)
    if is_in == None:
        task = await registration_service.put_user(email = email, password = password, name = name)
        return ("Registration was succussful")
    else:
        return ("Registration failed, user with this email is already registered")
@app.get("/get_free_time")
async def get_free_time(perm: str):
    return await table_service.get_free_time(perm = perm)
@app.post("/table/reserve_time")
async def reserve_time(time, person):
    # is_reserved = await table_service.get_free_time(perm = perm)
    # if :
    #     print("time succesfully reserved")
    # else:
    #     print("time already reserved")
    print(await table_service.get_free_time(time = time, person = person))
    await table_service.put_time(time = time, person = person)
    return ("time successfuly reserved!") 