from fastapi import FastAPI, Path, Cookie, Response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from services.registration_service import UserService
from services.table_service import TableService
from services.autentification_service import Autent
from API.NYTimes import NWTimes_API
from User_aut.auth2 import AuthJWT


app = FastAPI(title = "Service for PE in MISIS")

registration_service = UserService()

table_service = TableService()

NW_API = NWTimes_API()

class TokenInfo(BaseModel):
    access_token: str
    token_type: str

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
    
    
@app.get("/create_token")
async def create_token(id):
    data = {"token" : await Autent.create_token(id)}
    json_data = jsonable_encoder(data)
    return JSONResponse(content = json_data)
    


@app.post("/create_token2", response_model=TokenInfo)
def create_token(id):
    payload = {
        "sub": "1",
        "email": "1"
    }
    token = AuthJWT
    token.encode
    return TokenInfo(access_token = token,
                     token_type = "Bearer")
    
@app.get("/check_token")
def check_token(token):
    token = AuthJWT
#-------------------------------------------------------------TGBOT PART--------------------------------------------------------------------
#-------------------------------------------------------------API PART----------------------------------------------------------------------
@app.get("/get_books_author")
def get_books_author(author):
    return NW_API.get_reviews(author = author)
    #return NW_API.get_reviews(author = author)