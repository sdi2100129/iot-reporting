from pydantic import BaseModel # Import BaseModel for data validation, no longer need for init
from datetime import datetime
from typing import Literal # Import Literal for constrained types


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
    readingDate: datetime
    description: str

