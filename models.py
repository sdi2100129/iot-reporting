from pydantic import BaseModel # Import BaseModel for data validation, no longer need for init

class Sensor(BaseModel):
    sensorId: int   
    type: str
    vendorName: str
    vendorEmail: str
    description: str
    location: str

