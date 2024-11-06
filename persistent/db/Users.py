from persistent.db.base import Base, uuid4_as_str
from sqlalchemy import Column, Text, Table, Integer, MetaData


class User(Base):
    __tablename__ = "users"
    
    id = Column(Text, default = uuid4_as_str, primary_key=True)
    mame = Column(Text, default = "")
    email = Column(Text, default = "", unique = True)
    password = Column(Text, default = "")

# User = Table(
#     "users", 
#     metadata_obj,
#     id = Column(Text, default = uuid4_as_str, primary_key= True),
#     name = Column(Text, default = ""),
#     email = Column(Text, default = ""),
#     password = Column(Text, default = "")
# )