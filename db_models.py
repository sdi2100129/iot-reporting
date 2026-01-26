from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, Date, Time
from datetime import datetime, date, time
from sqlalchemy import ForeignKey
 

base = declarative_base()

#   Map to database tables
class Sensor(base):
    __tablename__ = "sensors"
    
    sensorId = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True, nullable=False)
    vendorName = Column(String, nullable=False)
    vendorEmail = Column(String, nullable=False)
    description = Column(String)
    location = Column(String, nullable=False)

class SensorReading(base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensorId = Column(Integer, ForeignKey("sensors.sensorId"))
    readingType = Column(String, nullable=False)
    readingValue = Column(Float, nullable=False)
    readingDate = Column(Date, default=date.today)
    readingTime = Column(Time, default=lambda: datetime.now().time())
    description = Column(String, nullable=True)
    
