from User_aut import auth
from pydantic import BaseModel
import os
from dotenv import load_dotenv#type: ignore
#io cpu bound

load_dotenv()
public_key = os.getenv("PUBLIC_KEY")
private_key = os.getenv("PRIVATE_KEY")
# class JWT(BaseModel):
#     path_to_JWT: str = 
    


class Autent:
    def __init__(self):
        ...
    async def create_token(id):
        return await auth.Token.give_token(id = id)
    async def check_token(request, authorization_header):
        return await auth.Token.check_access_token(request = request, authorization_header = authorization_header)