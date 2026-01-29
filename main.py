from fastapi import Depends, FastAPI
from models import Sensor, SensorReading
from database import SessionLocal, engine
from sqlalchemy.orm import Session
import db_models
from datetime import date, time
from fastapi import HTTPException


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

#   Adding cors headers to allow sharing resources between applications
origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from sqlalchemy import text

def reset_db():
    """
    Drops and recreates the public schema of the database.
    This effectively deletes all tables and data and resets the database.
    Used only for development/testing.
    """

    db = SessionLocal()
    db.execute(text("DROP SCHEMA public CASCADE;"))
    db.execute(text("CREATE SCHEMA public;"))
    db.commit()
    db.close()
reset_db()


#   Convert the classes into tables
db_models.base.metadata.create_all(bind=engine) 

@app.get("/")
def greet():
    """
    Root endpoint to test if the API is running.
    Returns:
        dict: Simple greeting message.
    """
        
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


def init_db():
    """
    Initializes the database with sample sensor data.
    Data is inserted only if the sensors table is empty.
    """

    db = SessionLocal()

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


def get_db():
    """
    Dependency that provides a database session every time we need to interact/connect with it.
    Ensures the session is properly closed after each request.
    """

    db = SessionLocal() 
    try:    
        yield db 
    finally:
        db.close() 


@app.get("/sensors")
def get_sensors(db : Session = Depends(get_db)):
    """
    Returns all sensors stored in the database.
    """

    db_sensors = db.query(db_models.Sensor).all()
    return {
        "success": True,
        "count": len(db_sensors),
        "data": db_sensors
    }

@app.get("/sensors/{sensorId}")
def get_sensor_by_id(sensorId: int, db : Session = Depends(get_db)):
    """
    Returns a sensor by its ID.
    """

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
    
    raise HTTPException(status_code=404, detail="Sensor not found")


@app.get("/readings")
def get_readings(db : Session = Depends(get_db)):
    """
    Returns all sensor readings.
    """

    db_readings = db.query(db_models.SensorReading).all()
    return {
        "success": True,
        "count": len(db_readings),
        "data": db_readings
    }
     

@app.post("/sensors")
def add_sensor(sensor: Sensor, db : Session = Depends(get_db)):
    """
    Adds a new sensor to the database with the provided details.
    If a sensor with the same sensorId already exists, returns an error.
    """

    existing = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensor.sensorId).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sensor with this ID already exists")   

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


@app.post("/readings")
def add_reading(reading: SensorReading, db: Session = Depends(get_db)):
    """
    Adds a new sensor reading to the database with the provided details.
    If a reading with the same id already exists, returns an error.
    Also checks if the associated sensor exists; if not, returns an error.
    """

    existing = db.query(db_models.SensorReading).filter(db_models.SensorReading.id == reading.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Reading with this ID already exists")
    
    sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == reading.sensorId).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor does not exist")
    
    if sensor.type != reading.readingType:
        raise HTTPException(status_code=422, detail="Reading type does not match sensor type")

    existing = db.query(db_models.SensorReading).filter(
    db_models.SensorReading.sensorId == reading.sensorId, 
    db_models.SensorReading.readingDate == reading.readingDate,
    db_models.SensorReading.readingTime == reading.readingTime
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Reading for this sensor at this time already exists"
        )

    
    db_reading = db_models.SensorReading(
        id=reading.id,
        sensorId=reading.sensorId,
        readingType=reading.readingType,
        readingValue=reading.readingValue,
        readingDate=reading.readingDate,
        description=reading.description,
        readingTime=reading.readingTime
    )

    db.add(db_reading)
    db.commit()
    return {
        "message": "Reading added successfully",
        "id" : reading.id,
        "sensorId": reading.sensorId,
        "readingType": reading.readingType,
        "readingValue": reading.readingValue,   
        "readingDate": reading.readingDate,
        "readingTime": reading.readingTime,
        "description": reading.description
    }


@app.delete("/readings/{readingId}")
def delete_reading(readingId: int, db : Session = Depends(get_db)):
    """
    Deletes a sensor reading by its ID.
    If the reading does not exist, returns an error.
    """

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
          
    raise HTTPException(status_code=404, detail="Reading not found")


@app.put("/sensors/{sensorId}")
def update_sensor(sensorId: int, updated_sensor: Sensor, db : Session = Depends(get_db)):
    """
    Updates an existing sensor's details with the new provided values using the provided sensorId.
    If the sensor does not exist, returns an error.
    """

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
    
    raise HTTPException(status_code=404, detail="Sensor not found")


@app.delete("/sensors/{sensorId}")
def delete_sensor(sensorId: int, db : Session = Depends(get_db)):
    """
    Deletes a sensor by its ID.
    If the sensor does not exist, returns an error.
    """

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
    
    raise HTTPException(status_code=404, detail="Sensor not found") 


@app.get("/readings/search")
def search_readings(
    sensor_type: str = None,
    location: str = None,
    time: time = None,
    page: int = 1,
    db: Session = Depends(get_db)
):
    """
    Searches for sensor readings based on optional filters: sensor type, location, and time.
    Supports pagination with a default page size of 10.
    1. sensor_type: Filter readings by the type of sensor (e.g., Temperature, Humidity).
    2. location: Filter readings by the location of the sensor (e.g., Main Hall, Lobby).
    3. time: Filter readings recorded after the specified time.
    4. page: Specify the page number for pagination (default is 1).
    Returns a paginated list of sensor readings matching the filters.
    """
    
    query = db.query(db_models.SensorReading).join(
        db_models.Sensor,
        db_models.Sensor.sensorId == db_models.SensorReading.sensorId
    )

    if sensor_type:
        query = query.filter(db_models.Sensor.type == sensor_type)

    if location:
        query = query.filter(db_models.Sensor.location == location)

    if time:
        query = query.filter(db_models.SensorReading.readingTime >= time)

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
    """
    Computes metrics on sensor readings based on optional filters: sensor type, location, and time.
    1. sensor_type: Filter readings by the type of sensor (e.g., Temperature, Acoustic, Humidity).
    2. location: Filter readings by the location of the sensor (e.g., Main Hall, Lobby).
    3. time: Filter readings recorded after the specified time.
    Returns metrics including count, range (min and max), mean, top 10 maximum, and top 10 minimum reading values.  
    """

    query = db.query(db_models.SensorReading).join(
        db_models.Sensor,
        db_models.Sensor.sensorId == db_models.SensorReading.sensorId
    )

    if sensor_type:
        query = query.filter(db_models.Sensor.type == sensor_type)

    if location:
        query = query.filter(db_models.Sensor.location == location)

    if time:
        query = query.filter(db_models.SensorReading.readingTime >= time)


    #   4. Metrics on readingValue of the results
    values = [r.readingValue for r in query.all()]

    if not values:
        raise HTTPException(status_code=404, detail="No readings found")

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

