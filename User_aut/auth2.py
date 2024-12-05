from pydantic import BaseModel
from dotenv import load_dotenv#type: ignore
import os
import jwt#type:ignore
from datetime import datetime


load_dotenv()

public_key = os.getenv("PUBLIC_KEY")
private_key = os.getenv("PRIVATE_KEY")

class AuthJWT():
    private_key = private_key
    public_key = public_key
    algorithm = "RS256"
    def encode(self, encode_data:dict):
        encode_data["exp"] = datetime.utcnow() + 15
        encode_data["iat"] = datetime.utcnow()
        encoded = jwt.encode(encode_data, private_key = self.private_key, algorithm = self.algorithm)
        return encoded
    def decode(self, decode_data):
        decoded = jwt.decode({decode_data}, public_key = self.public_key, algorithm = self.algorithm)
        return decoded