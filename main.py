from fastapi import Depends, FastAPI
from models import Sensor, SensorReading
from database import session, engine
from sqlalchemy.orm import Session
import db_models
from datetime import datetime

app = FastAPI()

from sqlalchemy import text

#def reset_db():
#    db = session()
#    db.execute(text("DROP SCHEMA public CASCADE;"))
#    db.execute(text("CREATE SCHEMA public;"))
#    db.commit()
#    db.close()
#reset_db()


#   Convert the classes into tables
db_models.base.metadata.create_all(bind=engine) 

@app.get("/")
def greet():
    return {"Hello": "World"}

#   Sample data
Sensors =  [
    Sensor(sensorId=1, type="Temperature", vendorName="SensorCorp", vendorEmail="sensorcorp@example.com", description="Temperature sensor in the main hall", location="Main Hall"),
    Sensor(sensorId=2, type="Humidity", vendorName="HumidityInc", vendorEmail="humidityinc@example.com", description="Humidity sensor in the rooftop", location="Rooftop"),
    Sensor(sensorId=3, type="Acoustic", vendorName="AcousticTech", vendorEmail="acoustictech@example.com", description="Pressure sensor in the elevator", location="Elevator" )
]

#   Initialize the database with the sample data
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

#   Every time we need to interact with the database
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

@app.get("/readings/")
def get_readings(db : Session = Depends(get_db)):
    db_readings = db.query(db_models.SensorReading).all()
    return db_readings
     

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


@app.post("/reading/")
def add_reading(reading: SensorReading, db: Session = Depends(get_db)):
    db_reading = db_models.SensorReading(
        sensorId=reading.sensorId,
        readingType=reading.readingType,
        readingValue=reading.readingValue,
        readingDate=reading.readingDate,
        description=reading.description
    )
    db.add(db_reading)
    db.commit()
    return reading


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


@app.get("/readings/search")
def search_readings(
    sensor_type: str = None,
    location: str = None,
    time: datetime = None,
    page: int = 1,
    db: Session = Depends(get_db)
):
    
    query = db.query(db_models.SensorReading).join(
        db_models.Sensor,
        db_models.Sensor.sensorId == db_models.SensorReading.sensorId
    )

    if sensor_type:
        query = query.filter(db_models.Sensor.type == sensor_type)

    if location:
        query = query.filter(db_models.Sensor.location == location)

    if time:
        query = query.filter(db_models.SensorReading.readingDate >= time)

    page_size = 10
    results = query.offset((page - 1) * page_size).limit(page_size).all()

    return results


@app.get("/readings/metrics")
def readings_metrics(
    sensor_type: str = None,
    location: str = None,
    time: datetime = None,
    db: Session = Depends(get_db)
):
    query = db.query(db_models.SensorReading).join(
        db_models.Sensor,
        db_models.Sensor.sensorId == db_models.SensorReading.sensorId
    )

    if sensor_type:
        query = query.filter(db_models.Sensor.type == sensor_type)

    if location:
        query = query.filter(db_models.Sensor.location == location)

    if time:
        query = query.filter(db_models.SensorReading.readingDate >= time)


    #   4. Metrics on readingValue of the results
    values = [r.readingValue for r in query.all()]

    if not values:
        return {"error": "No readings found"}

    values_sorted = sorted(values)

    return {
        "count": len(values),
        "range": {
            "min": min(values),
            "max": max(values)
        },
        "mean": sum(values) / len(values),
        "top10_max": values_sorted[-10:][::-1],
        "top10_min": values_sorted[:10]
    }

