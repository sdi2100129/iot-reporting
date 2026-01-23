from fastapi import Depends, FastAPI
from models import Sensor, SensorReading
from database import session, engine
from sqlalchemy.orm import Session
import db_models
from datetime import date, time

app = FastAPI()

#from fastapi.middleware.cors import CORSMiddleware

#   Adding cors headers to allow sharing resources between applications
#origins = ["http://localhost:3000"]

#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=origins,
#    allow_credentials=True,
#    allow_methods=["*"],
#    allow_headers=["*"],
#)


from sqlalchemy import text

def reset_db():
    db = session()
    db.execute(text("DROP SCHEMA public CASCADE;"))
    db.execute(text("CREATE SCHEMA public;"))
    db.commit()
    db.close()
reset_db()


#   Convert the classes into tables
db_models.base.metadata.create_all(bind=engine) 

@app.get("/")
def greet():
    return {"Hello": "World"}

#   Sample data
Sensors =  [
    Sensor(sensorId=1, type="Temperature", vendorName="SensorCorp", vendorEmail="sensorcorp@example.com", description="Temperature sensor in the main hall", location="Main Hall"),
    Sensor(sensorId=4, type="Temperature", vendorName="TempMasters", vendorEmail="tempmasters@example.com", description="Temperature sensor in the lobby", location="Lobby"),
    Sensor(sensorId=2, type="Humidity", vendorName="HumidityInc", vendorEmail="humidityinc@example.com", description="Humidity sensor in the rooftop", location="Rooftop"),
    Sensor(sensorId=5, type="Humidity", vendorName="ClimateControl", vendorEmail="climatecontrol@example.com", description="Humidity sensor in the basement", location="Basement"),
    Sensor(sensorId=3, type="Acoustic", vendorName="AcousticTech", vendorEmail="acoustictech@example.com", description="Pressure sensor in the elevator", location="Elevator"),
    Sensor(sensorId=6, type="Acoustic", vendorName="SoundWave", vendorEmail="soundwave@example.com", description="Acoustic sensor in the conference room", location="Conference Room")
]

#   Initialize the sensors database with the sample data
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

#   Every time we need to interact/connect with the database we create a new session
#   that we will close after the interaction
def get_db():
    db = session() 
    try:    
        yield db 
    finally:
        db.close() 


@app.get("/sensors/")
def get_sensors(db : Session = Depends(get_db)):
    db_sensors = db.query(db_models.Sensor).all()
    return {
        "success": True,
        "count": len(db_sensors),
        "data": db_sensors
    }

@app.get("/sensor/{sensorId}")
def get_sensor_by_id(sensorId: int, db : Session = Depends(get_db)):
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if db_sensor :
        return {
            "message": "Sensor updated successfully",
            "sensorId": db_sensor.sensorId,
            "sensorType": db_sensor.type,
            "vendorName": db_sensor.vendorName,
            "vendorEmail": db_sensor.vendorEmail,
            "description": db_sensor.description,
            "location": db_sensor.location
        }
    return {"error": "Sensor not found"}

@app.get("/readings/")
def get_readings(db : Session = Depends(get_db)):
    db_readings = db.query(db_models.SensorReading).all()
    return {
        "success": True,
        "count": len(db_readings),
        "data": db_readings
    }
     

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
    return {
        "message": "Sensor added successfully",
        "sensorId": sensor.sensorId,
        "sensorType": sensor.type,
        "vendorName": sensor.vendorName,
        "vendorEmail": sensor.vendorEmail,      
        "description": sensor.description,
        "location": sensor.location 
    }


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
    return {
        "message": "Reading added successfully",
        "sensorId": reading.sensorId,
        "readingType": reading.readingType,
        "readingValue": reading.readingValue,   
        "readingDate": reading.readingDate,
        "readingTime": reading.readingTime,
        "description": reading.description
    }


@app.delete("/reading/{readingId}")
def delete_reading(readingId: int, db : Session = Depends(get_db)):
    db_reading = db.query(db_models.SensorReading).filter(db_models.SensorReading.id == readingId).first()
    if db_reading:
        db.delete(db_reading)
        db.commit()
        return {
            "message": "Reading deleted successfully",
            "readingId": db_reading.id,
            "sensorId": db_reading.sensorId,
            "readingType": db_reading.readingType,
            "readingValue": db_reading.readingValue,
            "readingDate": db_reading.readingDate,
            "readingTime": db_reading.readingTime,
            "description": db_reading.description

        }  
          
    return {"error": "Reading not found"}


@app.put("/sensor/{sensorId}")
def update_sensor(sensorId: int, updated_sensor: Sensor, db : Session = Depends(get_db)):
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if db_sensor:
        db_sensor.type = updated_sensor.type
        db_sensor.vendorName = updated_sensor.vendorName
        db_sensor.vendorEmail = updated_sensor.vendorEmail
        db_sensor.description = updated_sensor.description
        db_sensor.location = updated_sensor.location
        db.commit()
        return {
            "message": "Sensor updated successfully",
            "sensorId": db_sensor.sensorId,
            "sensorType": db_sensor.type,
            "vendorName": db_sensor.vendorName,
            "vendorEmail": db_sensor.vendorEmail,
            "description": db_sensor.description,
            "location": db_sensor.location
        }
    
    return {"error": "Sensor not found"}


@app.delete("/sensor/{sensorId}")
def delete_sensor(sensorId: int, db : Session = Depends(get_db)):
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if db_sensor:
        db.delete(db_sensor)
        db.commit()
        return {
            "message": "Sensor deleted successfully",
            "sensorId": sensorId,
            "sensorType": db_sensor.type,
            "vendorName": db_sensor.vendorName, 
            "vendorEmail": db_sensor.vendorEmail,
            "description": db_sensor.description,
            "location": db_sensor.location
        }
    
    return {"error": "Sensor not found"}


@app.get("/readings/search")
def search_readings(
    sensor_type: str = None,
    location: str = None,
    time: time = None,
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

    return {
        "success": True,
        "count": len(results),
        "data": results
    }


@app.get("/readings/metrics")
def readings_metrics(
    sensor_type: str = None,
    location: str = None,
    time: time = None,
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

