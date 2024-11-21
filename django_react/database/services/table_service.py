from repositories.db.ttable_repository import TtableRepository

class TableService:
    def __init__(self):
        self.ttable_repository = TtableRepository()
    
    async def get_free_time(self, perm): 
        return await self.ttable_repository.get_free_time(perm = perm)
    
    async def put_time(self, time, person, is_free = 0):
        return await self.ttable_repository.put_time(time = time, person = person, is_free = is_free)    
    async def get_person_time(self, person):
        return await self.ttable_repository(person = person)
    
