from presentations.app import table_service
import asyncio
    # async def put_time(self, time:str, person:str) -> None:
    #     stmp = insert(TTable).values({"time":time, "is_free": 0, "by_whom" : person})
    #     async with self.sessionmaker() as session:
    #         await session.execute(stmp)
    #         await session.commit()
async def filling():
    for month in ["January", "February", "March", "April", "May", "June", "September", "October", "November", "December"]:
        for day in range(1, 32):
            for hour in range(8, 21):
                async with asyncio.TaskGroup() as tg:
                    tg.create_task(table_service.put_time(time = str(day) + " " + month + " " + str(hour) + ":00", person = "", is_free = 1))
asyncio.run(filling())