from persistent.db.Users import User
from infrastructure.connect import get_session
from sqlalchemy.future import select
from sqlalchemy import insert
from hashlib import sha256
import os
import uuid

class UserRepository:
    def __init__(self):
        pass

    # Для создания преподавателя
    async def put_teacher(self, name: str, password: str) -> None:
        hashed_password = sha256(password.encode()).hexdigest()
        token = str(uuid.uuid4())  # Генерация уникального токена

        stmt = insert(User).values({
            "id": str(uuid.uuid4()),  # Генерация уникального id
            "email": None,  # Преподаватели не имеют email в системе
            "name": name,
            "password": hashed_password,
            "token": token,
            "is_teacher": True  # Добавляем поле, которое будет различать преподавателей
        })

        async with get_session() as session:
            await session.execute(stmt)
            await session.commit()

    # Для создания студента
    async def put_student(self, name: str, email: str, password: str, group: str, student_number: str) -> None:
        hashed_password = sha256(password.encode()).hexdigest()
        token = str(uuid.uuid4())  # Генерация уникального токена

        stmt = insert(User).values({
            "id": str(uuid.uuid4()),  # Генерация уникального id
            "email": email,
            "name": name,
            "password": hashed_password,
            "token": token,
            "group": group,  # Группа
            "student_number": student_number,  # Номер студенческого
            "is_teacher": False  # Студенты помечаются отдельно
        })

        async with get_session() as session:
            await session.execute(stmt)
            await session.commit()

    async def get_user(self, email: str, password: str) -> str | None:
        hashed_password = sha256(password.encode()).hexdigest()
        stmt = select(User.id).where(User.email == email, User.password == hashed_password).limit(1)

        async with get_session() as session:
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()

        return user  # Если пользователя нет, вернется None
