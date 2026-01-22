from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime
import datetime

base = declarative_base()

class Sensor(base):
    __tablename__ = "sensors"
    
    sensorId = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    vendorName = Column(String)
    vendorEmail = Column(String)
    description = Column(String)
    location = Column(String)   

class SensorReading(base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensorId = Column(Integer, nullable=False)
    readingType = Column(String, nullable=False)
    readingValue = Column(Float, nullable=False)
    readingDate = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String, nullable=True)