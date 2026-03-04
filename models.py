# Import BaseModel for data validation and no longer need for initialization
# Pydantic converts data from server side into JSON format to send to client
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date, time
# Import Literal for constrained types
from typing import Literal 
import re


#   Python classes
class Sensor(BaseModel):
    sensorId: int = Field(..., gt=0)  
    type: Literal["Temperature", "Humidity", "Acoustic"] = Field(...)
    vendorName: str = Field(...)
    vendorEmail: EmailStr = Field(...)
    description: str
    location: str = Field(...)

    @field_validator("vendorName")
    def validate_vendor_name(cls, v):
        if not re.fullmatch(r"[A-Za-z ]+", v):
            raise ValueError("vendorName must contain only letters and spaces")
        return v


class SensorReading(BaseModel):
    id: int = Field(..., gt=0)
    sensorId: int = Field(..., gt=0)
    readingType: Literal["Temperature", "Humidity", "Acoustic"]
    readingValue: float 
    readingDate: date 
    readingTime: time 
    description: str


    @field_validator("readingValue")
    def validate_by_type(cls, v, info):
        t = info.data.get("readingType")

        if t == "Temperature" and not (-50 <= v <= 100):
            raise ValueError("Temperature out of range")
        if t == "Humidity" and not (0 <= v <= 100):
            raise ValueError("Humidity out of range")
        if t == "Acoustic" and not (0 <= v <= 200):
            raise ValueError("Acoustic out of range")

        return v

    @field_validator("readingDate")
    def no_future_date(cls, v):
        if v > date.today():
            raise ValueError("readingDate cannot be in the future")
        return v


#  What the frontend receive
class UserOut(BaseModel):
    id: int = Field(..., gt=0)
    username: str = Field(...)
    is_active: bool = Field(default=True)
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)


#  What the frontend send
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=72)

    @field_validator("password")
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v
    

class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str = Field(...)
    token_type: str = "bearer"
    scopes: list[str] = Field(default_factory=list)


class GoogleTokenIn(BaseModel):
    id_token: str