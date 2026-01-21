from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

base = declarative_base()

class Sensor(base):
    __tablename__ = "sensors"
    
    sensorId = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    vendorName = Column(String)
    vendorEmail = Column(String)
    description = Column(String)
    location = Column(String)   