# iot-reporting-api

A RESTful API built with FastAPI for managing sensors and their readings,
including filtering, metrics, and CRUD(Create, Read, Update, Deleete) operations.
In fastAPI Create is done with POST request, Read is done with GET request, Update is done with PUT request and Delete with DELETE request.


# Features
- CRUD operations for sensors
- CRUD operations for sensor readings
- Search readings by type, location, and time
- Metrics endpoint (min, max, mean, top 10)
- Automatic API docs with Swagger


# Project structure
.
├── main.py            # FastAPI app and routes
├── models.py          # Pydantic schemas
├── db_models.py       # SQLAlchemy models
├── database.py        # DB connection and session
└── requirements.txt


# Installation

1. Clone the repository:
```bash
git clone https://github.com/aorfanoudaki/iot-reporting-api.git
cd sensor-api

2. Create virtual environment:
python -m venv venv
source venv/bin/activate

3. Install dependencies:
pip install -r requirements.txt

4. Run:
uvicorn main:app --reload

# API Documentation
Once running, open:

- Swagger UI: http://127.0.0.1:8000/docs 


#  How to implement each request and what to expect in various cases

- get_sensors : does not need any parameter and will return all the sensors in the database

- get_sensor_by_id : user inserts an integer which represent the sensor id he is looking for and the execution will return the data stored for this sensor.

- get_readings : does not need any parameter and will return all the readings in the database or a message Sensor not found if there isn't a sensor with this id in the database. 

- add_sensor : user gives sensor data (id, type, vendor's name, vendor's email, a description and the sensor's location). A message saying "Sensor added successfully" will appear if the task was done or "Sensor with this ID already exists" if sensor with this ID already exists in the database.

- add_reading : expects a reading insert by the user (including id, the sensor's id, the reading's type, the value it measure, the date the measurement took place and the ). A message "Reading with this ID already exists" if the id is already used by an other reading saved in the database and so the user should type a different 






WEB-FRAMEWORK SELECTION:
For the implementation of REST API, I chose fastAPI for web framework, because - as a begginer in API's logic - is easy to learn , easy to develop with, as it reduces a significant part of human error and by reviews i read is also high performance, but i didn't test that. Also a huge advantage for me was the swagger UI feature that fastAPI provides that gave me the opportunity to test the responses of my requests without having to also create the front end, unlike flask or django.

LANGUAGE SELECTION:
The main programming language i used for the assingment was Python as it is simple, with many healpfull libraries and also works great with fastAPI. More specifically, i load my packages for the project in python Virtual Machine so it can run in other machines as well, not have to deal with conflict due to updates and also reduse the disk storage.

OS SELECTION:
I run the project in Linux using WSL for compatibility with other machines and better performance.

DATABASE LANGUAGE:
For the database implementation i used postgreSQL. Even if it would be easier for me to just use SQLite that doesn't need installation and connection with server unlike postgreSQL, all in all postegreSQL can handle more advanced queries and is a real production database. For easier develop i combine postgreSQL with SQLALchemy that can convert the python classes in the database tables making the queries easier to implement.


Run tests with  PYTHONPATH=. pytest


# TO FIX
- missing time field in SensorReading   CHECK
- consistency: 
    - get sensors, get sensor/{sensorId} return objects,
    - put sensor returns strings if db sensor but the error is a dictionary
    - ->   make every response in JSON format   CHECK *results ,*get sensors *get readings

- put and delete endpoint: sensorId is a query parameter while it should be in the path
 	/sensor/{sensorId}, to match the GET endpoint   CHECK


# TO DO
- Add validation    CHECK   , write unit tests (pytest) CHECK
- Write a complete README.md !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
- Add a .gitignore      CHECK 
- Add requirements.txt  CHECK