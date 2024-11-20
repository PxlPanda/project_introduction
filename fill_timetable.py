from presentations.app import table_service
import asyncio

    
    
async def filling():
    for month in ["January", "February", "March", "April", "May", "June", "September", "October", "November", "December"]:
        for day in range(1, 32):
            for hour in range(8, 21):
                async with asyncio.TaskGroup() as tg:
                    tg.create_task(table_service.put_time(time = str(day) + " " + month + " " + str(hour) + ":00", uuid = "", is_free = True))
asyncio.run(filling())
