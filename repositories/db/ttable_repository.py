from persistent.db.TimeTable import TTable
from infrastructure.sql.connect import sqlite_connection, create_all_sqlite_tables, psyco_connection, create_all_psyco_tables
from sqlalchemy import insert, select, update
import asyncio
from repositories.db.user_repository import UserRepository#type: ignore
from dotenv import load_dotenv#type: ignore
import os


load_dotenv()

class TtableRepository:
    def __init__(self):
        self.sessionmaker = psyco_connection()
        self.userrepository = UserRepository()
        create_all_psyco_tables()
    
    
    async def put_time(self, time:str, uuid:str):
        if await self.check_free_time(time):
            stmp = select(TTable.by_whom).where(TTable.time == time)
            async with self.sessionmaker() as session:
                current_users = await session.execute(stmp)
                await session.commit()
            current_users = current_users.fetchone()[0]
            if current_users.count("|") == int(os.getenv("MAX_STUDENTS_PER_LESSON")) - 1:
                stmp2 = update(TTable).values({"is_free": False, "by_whom" : (current_users + uuid + "|")}).where(TTable.time == time)
            else:
                stmp2 = update(TTable).values({"is_free": True, "by_whom" : (current_users + uuid + "|")}).where(TTable.time == time)
            async with self.sessionmaker() as session:
                await session.execute(stmp2)
                await session.commit()
    
    
    async def create_new_time(self, time:str, uuid:str, is_free) -> None:
        stmp = insert(TTable).values({"time":time, "is_free": is_free, "by_whom" : uuid})
        async with self.sessionmaker() as session:
            await session.execute(stmp)
            await session.commit()
            
            
    async def check_free_time(self, time:str):
        stmp = select(TTable.is_free).where(TTable.time == time)
        async with self.sessionmaker() as session:
            resp = await session.execute(stmp)
            await session.commit()
        resp = resp.fetchone()
        if resp == True:
            return True
        else:
            return False
        
        
    async def get_busy_time(self, uuid: str) -> str|None:
        if await self.userrepository.check_admin(uuid = uuid) == True:
            stmp = select(TTable.time).where(TTable.is_free == False)
    
            async with self.sessionmaker() as session:
                resp = await session.execute(stmp)
                
            row = resp.fetchall()

            if row is None:
                return None
            else:
                return [el[0] for el in row]
            
            
    async def get_free_time(self, uuid: str) -> str|None:
        stmp = select(TTable.is_free).where(TTable.time == True)
        
        async with self.sessionmaker() as session:
            resp = await session.execute(stmp)
                    
        row = resp.fetchall()

        if row is None:
            return None
        else:
            return row
            
            
    async def get_person_time(self, uuid:str) -> str|None:
        stmp = select(). where (TTable.by_whom == uuid)
        
        async with self.sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchall()
            
        if row is None:
            return None
        else:
            return [el[0] for el in row]
        