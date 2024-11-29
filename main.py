from presentations.app import app
from services.bot_service.bot import main as m
import asyncio
import uvicorn
import threading

def start_app():
    uvicorn.run(app)


async def start_bot():
    await m()


threading.Thread(target = start_app).start()

asyncio.run(start_bot())