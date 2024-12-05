from persistent.db.base import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from pydantic_settings import BaseSettings, SettingsConfigDict#type:ignore
from dotenv import load_dotenv#type: ignore
import os
import asyncio

load_dotenv()


#---------------------------------------------------postgres-----------------------------------------------
class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASS: str
    DB_NAME: str
    
    @property
    def DATABASE_URL_psycopg(self):
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    

settings = Settings(DB_HOST = os.getenv("DB_HOST"), DB_PORT = os.getenv("DB_PORT"), DB_USER = os.getenv("DB_USER"), DB_NAME = os.getenv("DB_NAME"), DB_PASS = os.getenv("DB_PASSWORD"))


def psyco_connection() -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(settings.DATABASE_URL_psycopg)

    return async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_all_psyco_tables() -> None:
    engine = create_async_engine(settings.DATABASE_URL_psycopg)
    
    
    async def init_models():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(init_models())


#----------------------------------------------------------sqlite--------------------------------------------------------
_url = "/sql_app.db"


def sqlite_connection() -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(f"sqlite+aiosqlite://{_url}", connect_args={"check_same_thread": False})

    return async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_all_sqlite_tables() -> None:
    engine = create_engine(f"sqlite://{_url}", connect_args={"check_same_thread": False})

    Base.metadata.create_all(engine)




