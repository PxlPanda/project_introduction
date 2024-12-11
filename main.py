from presentations.app import app
from services.bot_service.bot import main as m
import asyncio
import uvicorn
import threading
from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def start_app():
    uvicorn.run(app)


async def start_bot():
    await m()


threading.Thread(target = start_app).start()

asyncio.run(start_bot())
asyncio.run(start_app())