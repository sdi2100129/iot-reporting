from fastapi import Depends, FastAPI
from models import Sensor
from database import session, engine
from sqlalchemy.orm import Session
import db_models

app = FastAPI()

db_models.base.metadata.create_all(bind=engine) # Create tables according to python classes

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

def init_db():
    db = session()

    count = db.query(db_models.Sensor).count()
    if count == 0:
        for sensor in Sensors:
            db_sensor = db_models.Sensor(
                sensorId=sensor.sensorId,
                type=sensor.type,
                vendorName=sensor.vendorName,
                vendorEmail=sensor.vendorEmail,
                description=sensor.description,
                location=sensor.location
            )
            db.add(db_sensor)
        db.commit()
    db.close()


init_db()

# Every time we need to interact with the database
def get_db():
    db = session() 
    try:    
        yield db 
    finally:
        db.close() 


@app.get("/sensors/")
def get_sensors(db : Session = Depends(get_db)):
    db_sensors = db.query(db_models.Sensor).all()
    return db_sensors

@app.get("/sensor/{sensorId}")
def get_sensor_by_id(sensorId: int, db : Session = Depends(get_db)):
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if db_sensor :
        return db_sensor
    return {"error": "Sensor not found"}
     

@app.post("/sensor/")
def add_sensor(sensor: Sensor, db : Session = Depends(get_db)):
    db_sensor = db_models.Sensor(
        sensorId=sensor.sensorId,
        type=sensor.type,
        vendorName=sensor.vendorName,
        vendorEmail=sensor.vendorEmail,
        description=sensor.description,
        location=sensor.location
    )
    db.add(db_sensor)
    db.commit()
    return sensor

@app.put("/sensor/")
def update_sensor(sensorId: int, updated_sensor: Sensor, db : Session = Depends(get_db)):
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if db_sensor:
        db_sensor.type = updated_sensor.type
        db_sensor.vendorName = updated_sensor.vendorName
        db_sensor.vendorEmail = updated_sensor.vendorEmail
        db_sensor.description = updated_sensor.description
        db_sensor.location = updated_sensor.location
        db.commit()
        return "Sensor updated successfully"
    
    return {"error": "Sensor not found"}

@app.delete("/sensor/")
def delete_sensor(sensorId: int, db : Session = Depends(get_db)):
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if db_sensor:
        db.delete(db_sensor)
        db.commit()
        return "Sensor deleted successfully"
    
    return {"error": "Sensor not found"}