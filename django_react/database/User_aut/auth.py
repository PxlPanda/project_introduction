# user_aut/auth.py

from jose import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")  # Используйте переменные окружения для хранения ключа

class Token:
    @staticmethod
    def give_token(id: str):
        # Создание JWT токена
        return jwt.encode({"sub": id}, JWT_SECRET, algorithm="HS256")

    @staticmethod
    def check_access_token(token: str) -> str:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            return payload["sub"]  # Возвращаем ID пользователя из токена
        except jwt.ExpiredSignatureError:
            raise Exception("Token expired")
        except jwt.JWTError:
            raise Exception("Invalid token")
