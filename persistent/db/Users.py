from persistent.db.base import Base, uuid4_as_str
from sqlalchemy import Column, Text

class User(Base):
    __tablename__ = "users"
    id = Column(Text, default = uuid4_as_str, primary_key=True)
    mame = Column(Text, default = "")
    email = Column(Text, default = "")
    password = Column(Text, default = "")