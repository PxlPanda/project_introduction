from repositories.db.user_repository import UserRepository

class UserService:
    def __init__(self):
        self.user_repository = UserRepository()
        
    async def get_user(self, email: str, password: str)-> str|None:
        return await self.user_repository.get_user(email = email, password = password)
    async def put_user(self, name, email, password):
        return await self.user_repository.put_user(name = name, email = email, password = password)