from persistent.db.Users import User
from infrastructure.sql.connect import sqlite_connection, create_all_tables
from sqlalchemy import insert, select
from User_aut.auth import Token
from persistent.db.base import uuid4_as_str
import os
from hashlib import sha256

class UserRepository:
    def __init__(self) -> None:
        self._sessionmaker = sqlite_connection()
        create_all_tables()
        
    async def put_user(self, name:str, email:str, password:str) -> None:
        uuid = uuid4_as_str()
        token = str(Token.give_token(id = uuid))
        hashed_password = sha256()
        hashed_password.update(password.encode())
        hashed_password.update(os.getenv("SALT").encode())
        stmp = insert(User).values({"id":uuid, "email":email, "name":name, "password":hashed_password.hexdigest(), "token":token}) 
        
        async with self._sessionmaker() as session:
            await session.execute(stmp)
            await session.commit()
            
    async def get_user(self, email:str, password:str) -> str|None:
        hashed_password = sha256()
        hashed_password.update(password.encode())
        hashed_password.update(os.getenv("SALT".encode()))
        stmp = select(User.id).where(User.password == hashed_password, User.email == email).limit(1)
            
        async with self._sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchone()
        if row is None:
            return None
        else:
            return row[0]
        
    #kak po DRY?
    async def get_user_by_uuid(self, uuid:str) -> str|None:
        stmp = select(User.id).where(User.uuid == uuid).limit(1)
            
        async with self._sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchone()
        if row is None:
            return None
        else:
            return row[0]