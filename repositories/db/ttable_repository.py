from persistent.db.TimeTable import TTable
from infrastructure.sql.connect import sqlite_connection
from sqlalchemy import insert, select, update
import asyncio
from repositories.db.user_repository import UserRepository#type: ignore


class TtableRepository:
    def __init__(self):
        self.sessionmaker = sqlite_connection()
        self.userrepository = UserRepository()
    
    async def put_time(self, time:str, uuid:str, is_free) -> None:
        stmp = update(TTable).values({"is_free": is_free, "by_whom" : uuid}).where(TTable.time == time)
        async with self.sessionmaker() as session:
            await session.execute(stmp)
            await session.commit()
    
    async def create_new_time(self, time:str, uuid:str, is_free) -> None:
        stmp = insert(TTable).values({"time":time, "is_free": is_free, "by_whom" : uuid})
        async with self.sessionmaker() as session:
            await session.execute(stmp)
            await session.commit()
    
    async def get_busy_time(self, uuid: str) -> str|None:
        print(await self.userrepository.check_admin(uuid = uuid))
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
            
    async def get_person_time(self, person:str) -> str|None:
        stmp = select(). where (TTable.by_whom == person)
        
        async with self.sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchall()
            
        if row is None:
            return None
        else:
            return [el[0] for el in row]
        