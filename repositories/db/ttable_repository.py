from persistent.db.TimeTable import TTable
from infrastructure.sql.connect import sqlite_connection
from sqlalchemy import insert, select
import asyncio

class TtableRepository:
    def __init__(self):
        self.sessionmaker = sqlite_connection()
    
    async def put_time(self, time:str, person:str, is_free:int = 0) -> None:
        stmp = insert(TTable).values({"time":time, "is_free": 0, "by_whom" : person})
        async with self.sessionmaker() as session:
            await session.execute(stmp)
            await session.commit()
    
    async def get_free_time(self, perm: str) -> str|None:
        if perm == "admin":
            stmp = select(TTable.time). where (TTable.is_free == 1)
    
            async with self.sessionmaker() as session:
                resp = await session.execute(stmp)
                
            row = resp.fetchall()

            if row is None:
                return None
            else:
                return [el[0] for el in row]
            
    async def get_person_time(self, person:str) -> str|None:
        stmp = select(). where (TTable.by_whom == person)
        
        async with self.sessionmaker() as session:
            resp = await session.execute(stmp)
            
        row = resp.fetchall()
            
        if row is None:
            return None
        else:
            return [el[0] for el in row]
        