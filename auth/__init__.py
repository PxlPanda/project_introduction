from fastapi import APIRouter
from fastapi.security import HTTPBasic, HTTPBasicCredentials

router = APIRouter()

# @router.get("/baseic-auth/")
# def demo_basic_auth_credentials(
#     credentials: Annotated[]
# )