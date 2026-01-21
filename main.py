from fastapi import FastAPI
from models import Sensor
from database import session, engine
import database

app = FastAPI()

database.base.metadata.create_all(bind=engine) # Create tables according to python classes

@app.get("/")
def greet():
    return {"Hello": "World"}

Sensors =  [
    Sensor(sensorId=1, type="Temperature", vendorName="SensorCorp", vendorEmail="sensorcorp@example.com", description="Temperature sensor in the main hall", location="Main Hall"),
    Sensor(sensorId=5, type="Humidity", vendorName="HumidityInc", vendorEmail="humidityinc@example.com", description="Humidity sensor in the main hall", location="Main Hall"),
    Sensor(sensorId=3, type="Pressure", vendorName="PressureTech", vendorEmail="pressuretech@example.com", description="Pressure sensor in the main hall", location="Main Hall"),
    Sensor(sensorId=9, type="Light", vendorName="LightSolutions", vendorEmail="lightsolutions@example.com", description="Light sensor in the main hall", location="Main Hall"),
    Sensor(sensorId=2, type="Motion", vendorName="MotionMakers", vendorEmail="motionmakers@example.com", description="Motion sensor in the main hall", location="Main Hall")

]

@app.get("/sensors/")
def get_sensors():
    db = session()
    sensors_in_db = db.query(Sensor).all()
    return Sensors

@app.get("/sensor/{sensorId}")
def get_sensor_by_id(sensorId: int):
    for sensor in Sensors:
        if sensor.sensorId == sensorId:
            return sensor
    
    return {"error": "Sensor not found"}

@app.post("/sensor/")
def add_sensor(sensor: Sensor):
    Sensors.append(sensor)
    return sensor

@app.put("/sensor/")
def update_sensor(sensorId: int, updated_sensor: Sensor):
    for i in range(len(Sensors)):
        if Sensors[i].sensorId == sensorId:
            Sensors[i] = updated_sensor
            return "Sensor updated successfully"
        
    return {"error": "Sensor not found"}

@app.delete("/sensor/")
def delete_sensor(sensorId: int):
    for i in range(len(Sensors)):
        if Sensors[i].sensorId == sensorId:
            del Sensors[i]
            return "Sensor deleted successfully"
        
    return {"error": "Sensor not found"}