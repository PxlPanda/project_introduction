from persistent.db.base import Base
from sqlalchemy import Column, Integer, Text, Boolean


class TTable(Base):
    __tablename__ = "ttable"
    
    time = Column(Text, primary_key = True)
    is_free =Column (Integer, default = 1)
    by_whom = Column (Text, default = "")
    