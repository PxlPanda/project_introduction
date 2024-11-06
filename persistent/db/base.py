from sqlalchemy import MetaData
from sqlalchemy.orm import declarative_base
import uuid

Base = declarative_base(metadata = MetaData())


def uuid4_as_str() -> str:
    return (str(uuid.uuid4))