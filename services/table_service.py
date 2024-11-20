from repositories.db.ttable_repository import TtableRepository

class TableService:
    def __init__(self):
        self.ttable_repository = TtableRepository()
    
    async def get_busy_time(self, uuid): 
        return await self.ttable_repository.get_busy_time(uuid = uuid)
    
    async def put_time(self, time, uuid, is_free = False):
        return await self.ttable_repository.put_time(time = time, uuid=uuid, is_free = is_free)  
      
    async def get_person_time(self, person):
        return await self.ttable_repository(person = person)
    
    
    async def get_free_time(self, time): 
        return await self.ttable_repository.get_free_time(time = time)