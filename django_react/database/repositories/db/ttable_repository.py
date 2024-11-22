# repositories/ttable_repository.py

from persistent.db.Timetable import Timetable  # Модель расписания
from infrastructure.connect import get_session
from sqlalchemy.future import select
from sqlalchemy import insert

class TtableRepository:
    async def put_time(self, time: str, person: str, is_free: int = 0):
        stmt = insert(Timetable).values({
            "time": time,
            "person": person,
            "is_free": is_free
        })
        async with get_session() as session:
            await session.execute(stmt)
            await session.commit()

    async def get_free_time(self, person: str):
        stmt = select(Timetable).where(Timetable.person == person, Timetable.is_free == 1)
        async with get_session() as session:
            result = await session.execute(stmt)
            return result.scalars().all()
