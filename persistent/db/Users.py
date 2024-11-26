from persistent.db.base import Base, uuid4_as_str
from sqlalchemy import Column, Text, Table, Integer, MetaData, Boolean


class User(Base):
    __tablename__ = "users"
    
    id = Column(Text, default = uuid4_as_str(), primary_key=True)
    token = Column(Text, unique= True)  
    name = Column(Text, default = "")
    surname = Column(Text, default = "")
    patronymic = Column(Text, default = "")
    email = Column(Text, default = "", unique = True)
    password = Column(Text, default = "")
    is_male = Column(Boolean, default = "False")
    is_admin = Column(Boolean, default = "False")
    is_checked = Column(Boolean, default = "False")
    email_num = Column(Text, default = "")
