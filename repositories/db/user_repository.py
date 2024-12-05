from persistent.db.Users import User
from infrastructure.sql.connect import sqlite_connection, create_all_sqlite_tables, psyco_connection, create_all_psyco_tables
from sqlalchemy import insert, select
from User_aut.auth import Token
from persistent.db.base import uuid4_as_str
import os
from hashlib import sha256
from dotenv import load_dotenv#type: ignore
from User_aut.mail_validation import send_email
from pydantic import BaseModel


load_dotenv()

admin_emails = set(os.getenv("ADMIN_EMAILS").split("|"))


class UserRepository:
    def __init__(self) -> None:
        self._sessionmaker = psyco_connection()
        create_all_psyco_tables()
        
    async def put_user(self, name:str, surname, patronymic, email:str, password:str) -> None:
        is_admin = "False"
        if email in admin_emails:
            is_admin = "True"
        uuid = uuid4_as_str()
        token = str(Token.give_token(id = uuid))
        hashed_password = sha256()
        password = password + os.getenv("SALT")
        hashed_password.update(password.encode())
        hashed_password = str(hashed_password.hexdigest())
        #email_num = await send_email()
        stmp = insert(User).values({"id" : uuid, "email" : email, "name" : name, "surname" : surname, "patronymic" : patronymic, "password" : hashed_password, "is_admin" : is_admin, "token" : token})
        
        async with self._sessionmaker() as session:
            await session.execute(stmp)
            await session.commit()
            
    async def get_user(self, email:str, password:str) -> str|None:
        hashed_password = sha256()
        hashed_password.update(password.encode())
        hashed_password.update(os.getenv("SALT").encode())
        stmp = select(User.token).where(User.password == hashed_password.hexdigest(), User.email == email).limit(1)
            
        async with self._sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchone()
        if row is None:
            return None
        else:
            return row[0]


    async def check_user(self, email:str) -> str|None:
        stmp = select(User.id).where(User.email == email).limit(1)
            
        async with self._sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchone()
        if row is None:
            return None
        else:
            return row[0]
        
        
    #kak po DRY?
    async def check_admin(self, uuid:str) -> str|None:
        stmp = select(User.is_admin).where(User.id == uuid).limit(1)
            
        async with self._sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchone()
        if row is None:
            return None
        else:
            return row[0]

    async def check_email_code(self, uuid):
        ...