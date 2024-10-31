from persistent.db.TimeTable import TTable
from infrastructure.sql.connect import sqlite_connection
from sqlalchemy import insert, select


class TtableRepository:
    def __init__(self):
        self.sessionmaker = sqlite_connection()
    
    async def put_time(self, time:str, person:str) -> None:
        stmp = insert(TTable).values({"time":time})
        stmp2 = insert(TTable).values({"by_whom":person})
        async with self.sessionmaker() as session:
            await session.execute(stmp, stmp2)
            await session.commit()
    
    async def get_free_time(self, prom: str) -> str|None:
        stmp = select(). where (TTable.free == True)
    
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
                return row