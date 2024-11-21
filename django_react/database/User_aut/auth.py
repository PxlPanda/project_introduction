from fastapi.security import APIKeyHeader
from jose import jwt#type: ignore
import os
from dotenv import load_dotenv # type: ignore
from fastapi import Request, Security
import jwt


load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

class Token():
    def __init__(self):
        ...
    def give_token(id):
        token = jwt.encode(payload={"sub": id}, key=JWT_SECRET, algorithm="HS256")
        return token
    async def check_access_token(
        request: Request,
        authorization_header: str = Security(APIKeyHeader(name="Authorization", auto_error=False))
    ) -> str:
        # Проверяем, что токен передан
        if authorization_header is None:
            raise Exception()

        # Проверяем токен на соответствие форме
        if "Bearer " not in authorization_header:
            raise Exception()

        # Убираем лишнее из токена
        clear_token = authorization_header.replace("Bearer ", "")

        try:
            # Проверяем валидность токена
            payload = jwt.decode(jwt=clear_token, key=JWT_SECRET, algorithms=["HS256", "RS256"])
        except Exception:
            # В случае невалидности возвращаем ошибку
            raise Exception()
        
        # Идентифицируем пользователя
        return payload["sub"]