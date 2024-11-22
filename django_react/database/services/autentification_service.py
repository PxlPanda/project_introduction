# services/authentification_service.py

from repositories.user_repository import UserRepository
from user_aut.auth import Token
from hashlib import sha256

class AuthService:
    def __init__(self):
        self.user_repository = UserRepository()
        self.token_service = Token()

    async def authenticate_user(self, email: str, password: str):
        user_id = await self.user_repository.get_user(email, password)
        if user_id is None:
            return None  # Неверный логин или пароль

        # Создаем токен для аутентифицированного пользователя
        token = self.token_service.give_token(user_id)
        return token

    def check_token(self, token: str) -> str:
        return self.token_service.check_access_token(token)
