from fastapi import Depends, FastAPI
from models import Sensor, SensorReading
from database import SessionLocal, engine
from sqlalchemy.orm import Session
import db_models
from datetime import date, time
from fastapi import HTTPException
import sqlalchemy.exc
from sampledata.sensors import Sensors
from sampledata.readings import Readings
import logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi import Request
from fastapi.exceptions import RequestValidationError


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("api")

app = FastAPI()


@app.exception_handler(FastAPIHTTPException)
async def log_http_exceptions(request: Request, exc: FastAPIHTTPException):
    logger.warning(
        f"HTTP {exc.status_code} | {request.method} {request.url.path} | {exc.detail}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def log_validation_errors(request, exc: RequestValidationError):
    # Convert any non-serializable objects in exc.errors() to strings
    def make_serializable(e):
        e_copy = e.copy()
        if 'ctx' in e_copy:
            e_copy['ctx'] = {k: str(v) for k, v in e_copy['ctx'].items()}
        return e_copy

    errors_serializable = [make_serializable(e) for e in exc.errors()]

    logger.warning(
        f"HTTP 422 | {request.method} {request.url.path} | Validation error: {errors_serializable}"
    )

    return JSONResponse(
        status_code=422,
        content={"detail": errors_serializable},
    )



from fastapi.middleware.cors import CORSMiddleware

#   Adding Cross Origin Resource Sharing headers to allow sharing resources between applications
#   If fastAPI does not declare explicity that the browser is allowed to read data from another origin it blocks the response
origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    #   who is allowed to call me
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from sqlalchemy import text


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


def init_db():
    """
    Initializes the database with sample sensor data and readings.
    Data is inserted only if the tables are empty.
    """

    db = SessionLocal()

    # ---- Seed Sensors ----
    sensor_count = db.query(db_models.Sensor).count()
    if sensor_count == 0:
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

    # ---- Seed Readings ----
    reading_count = db.query(db_models.SensorReading).count()
    if reading_count == 0:
        for r in Readings:
            db_reading = db_models.SensorReading(
                id=r.id,
                sensorId=r.sensorId,
                readingType=r.readingType,
                readingValue=r.readingValue,
                readingDate=r.readingDate,
                readingTime=r.readingTime,
                description=r.description
            )
            db.add(db_reading)

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
            "message": "Sensor retrieved successfully",
            "sensorId": db_sensor.sensorId,
            "type": db_sensor.type,
            "vendorName": db_sensor.vendorName,
            "vendorEmail": db_sensor.vendorEmail,
            "description": db_sensor.description,
            "location": db_sensor.location
        }
    
    raise HTTPException(status_code=404, detail="Sensor not found")


@app.get("/readings")
def get_readings( page: int = 1, db : Session = Depends(get_db)):
    """
    Returns all sensor readings.
    """
    page_size = 10
    db_readings = db.query(db_models.SensorReading)
    total = db_readings.count()

    results = db_readings.offset((page - 1) * page_size).limit(page_size).all()

    # when no readings return 1 page not 0
    pages = max(1, (total + page_size - 1) // page_size)

    return {
        "success": True,
        "page": page,
        "page_size": page_size,
        "total": total,
        "pages": pages,
        "data": results
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
def delete_sensor(sensorId: int, db: Session = Depends(get_db)):
    """
    Deletes a sensor by its ID along with all its readings.
    If the sensor does not exist, returns 404.
    """
    # Fetch the sensor
    db_sensor = db.query(db_models.Sensor).filter(db_models.Sensor.sensorId == sensorId).first()
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    # Delete all readings associated with this sensor
    db.query(db_models.SensorReading).filter(
        db_models.SensorReading.sensorId == sensorId
    ).delete(synchronize_session=False)

    # Delete the sensor itself
    db.delete(db_sensor)
    db.commit()

    return {
        "message": "Sensor and all its readings deleted successfully",
        "sensorId": sensorId,
        "sensorType": db_sensor.type,
        "vendorName": db_sensor.vendorName,
        "vendorEmail": db_sensor.vendorEmail,
        "description": db_sensor.description,
        "location": db_sensor.location
    }


@app.get("/readings/search")
def search_readings(
    sensor_type: str = None,
    location: str = None,
    date: date = None,  
    time: time = None,
    page: int = 1,
    db: Session = Depends(get_db)
):
    """
    Searches for sensor readings based on optional filters: sensor type, location, and time.
    Supports pagination with a default page size of 10.
    1. sensor_type: Filter readings by the type of sensor (e.g., Temperature, Humidity).
    2. location: Filter readings by the location of the sensor (e.g., Main Hall, Lobby).
    3. date: Filter readings from a specific calendar day.
    4. time: Filter readings recorded after the specified time.
    5. page: Specify the page number for pagination (default is 1).
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

    if date:
        query = query.filter(db_models.SensorReading.readingDate == date)

    if time:
        query = query.filter(db_models.SensorReading.readingTime == time)

    page_size = 10
    total = query.count()
    results = query.offset((page - 1) * page_size).limit(page_size).all()


    pages = max(1, (total + page_size - 1) // page_size)

    return {
        "success": True,
        "count": len(results),
        "total": total,
        "pages": pages,
        "data": results
    }


@app.get("/metrics")
def readings_metrics(
    sensor_type: str = None,
    location: str = None,
    date: date = None,  
    time: time = None,
    db: Session = Depends(get_db)
):
    """
    Computes metrics on sensor readings based on optional filters: sensor type, location, and time.
    1. sensor_type: Filter readings by the type of sensor (e.g., Temperature, Acoustic, Humidity).
    2. location: Filter readings by the location of the sensor (e.g., Main Hall, Lobby).
    3. date: Filter readings from a specific calendar day.
    4. time: Filter readings recorded after the specified time.
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

    if date:
        query = query.filter(db_models.SensorReading.readingDate == date)

    if time:
        query = query.filter(db_models.SensorReading.readingTime == time)


    #   4. Metrics on readingValue of the results
    values = [r.readingValue for r in query.all()]

    if not values:
        return {
            "count": 0,
            "range": None,
            "mean": None,
            "top10_max": [],
            "top10_min": []
    }

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

