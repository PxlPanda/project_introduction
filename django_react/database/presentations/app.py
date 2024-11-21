from fastapi import FastAPI, Path, HTTPExtension
from pydantic import BaseModel
import sqlite3
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
def auth(email:str, password:str) -> str:
    if registration_service.get_user(email = email, password = password) != None:
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
@app.get("/token_check")
def check_token(request, authorization_header):
    Autent.check_token(request, authorization_header)
@app.post("/create_token")
def create_token(id):
    Autent.create_token(id)


# Модель запросов для входа и регистрации
class UserData(BaseModel):
    username: str
    password: str

# Подключение к базе данных SQLite
def get_db_connection():
    conn = sqlite3.connect("database.sqlite3")
    conn.row_factory = sqlite3.Row
    return conn

# Эндпоинт для регистрации (первый вход)
@app.post("/register")
def register(user_data: UserData):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Проверка, существует ли уже пользователь
    cursor.execute("SELECT * FROM users WHERE username = ?", (user_data.username,))
    user = cursor.fetchone()

    if user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    # Добавление нового пользователя
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (user_data.username, user_data.password))
    conn.commit()
    conn.close()

    return {"message": "Регистрация успешна"}

# Эндпоинт для входа
@app.post("/login")
def login(user_data: UserData):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Проверка логина и пароля
    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (user_data.username, user_data.password))
    user = cursor.fetchone()

    if user:
        return {"message": "Успешный вход", "user_id": user["id"]}
    else:
        raise HTTPException(status_code=401, detail="Неправильный логин или пароль")