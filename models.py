# Import BaseModel for data validation and no longer need for initialization
# Pydantic converts data from server side into JSON format to send to client
from pydantic import BaseModel 
from datetime import date, time
# Import Literal for constrained types
from typing import Literal 


#   Python classes
class Sensor(BaseModel):
    sensorId: int   
    type: Literal["Temperature", "Humidity", "Acoustic"]
    vendorName: str
    vendorEmail: str
    description: str
    location: str


class SensorReading(BaseModel):
    id: int
    sensorId: int
    readingType: str
    readingValue: float
    readingDate: date
    readingTime: time
    description: str
    

