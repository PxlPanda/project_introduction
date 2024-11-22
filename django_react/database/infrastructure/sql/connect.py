# infrastructure/connect.py

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("SQLITE_DB_PATH", "sqlite:///db/sql_app.db")  # Используем переменную окружения или по умолчанию

# Создание асинхронного соединения с SQLite
engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Функция для получения сессии
async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
