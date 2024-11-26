from tg_bot.handlers import router

import asyncio
import logging

import os
from dotenv import load_dotenv#type:ignore

from aiogram import Bot, Dispatcher
from aiogram.enums.parse_mode import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

import config#type: ignore


load_dotenv()

async def main():
    bot = Bot(token = os.getenv("TG_BOT_TOKEN"))
    dp = Dispatcher(storage = MemoryStorage())
    dp.include_router(router)
    async with asyncio.TaskGroup() as tg:
        tg.create_task(bot.delete_webhook(drop_pending_updates=True))
        tg.create_task(dp.start_polling(bot, allowed_updates = dp.resolve_used_update_types()))

logging.basicConfig(level = logging.INFO)
asyncio.run(main)
