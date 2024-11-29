from fastapi import FastAPI, Path, Cookie, Response
from pydantic import BaseModel
from services.registration_service import UserService
from services.table_service import TableService
from services.autentification_service import Autent


app = FastAPI(title = "Service for PE in MISIS")

registration_service = UserService()

table_service = TableService()


@app.post("/login")
async def auth(email:str, password:str, response:Response) -> str:
    answer = await registration_service.get_user(email = email, password = password)
    if answer != None:
        response.set_cookie(key = "JWT", value = str(answer))
        return "Йоу чел эшкере, ты атентифицирован, мои поздравления"
    else: 
        return "login failed"
    
    
@app.post("/signin")
async def register(email:str, password: str, name: str, surname: str, patronymic: str) -> str:
    is_in = await registration_service.get_user(email = email, password=password)
    if is_in == None:
        task = await registration_service.put_user(email = email, password = password, name = name, surname = surname, patronymic = patronymic)
        return ("Registration was succussful")
    else:
        return ("Registration failed, user with this email is already registered")
    
    
@app.get("/play_with_cookie")
async def get_cookie(token = Cookie()):
    return token

    
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
async def create_token(id):
    return await Autent.create_token(id)
    
    
#-------------------------------------------------------------TGBOT PART--------------------------------------------------------------------