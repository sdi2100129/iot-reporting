# iot-reporting-api

A full-stack system for managing Sensors and Readings in an IoT environment,
including filtering, metrics, and CRUD(Create, Read, Update, Deleete) operations.
In fastAPI Create is done with POST request, Read is done with GET request, Update is done with PUT request and Delete with DELETE request.


# Features
- CRUD operations for sensors
- CRUD operations for sensor readings
- Search readings by type, location, and time
- Metrics endpoint (min, max, mean, top 10)
- Automatic API docs with Swagger


# Project structure
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── db_models.py
│   ├── database.py
│   └── ...
│
└── frontend/
    ├── src/
    │   ├── api.js
    │   ├── components/
    │   │   ├── Sensors/
    │   │   │   ├── Sensors.jsx
    │   │   │   ├── SensorForm.jsx
    │   │   │   └── SensorList.jsx
    │   │   └── Readings/
    │   │       ├── Readings.jsx
    │   │       ├── ReadingForm.jsx
    │   │       └── ReadingList.jsx
    │   └── main.jsx



# Installation

1. Clone the repository:
git clone https://github.com/aorfanoudaki/iot-reporting-api.git
cd sensor-api

2. Create virtual environment:
python -m venv venv
source venv/bin/activate

3. Install dependencies:
pip install -r requirements.txt


#   To run back end

uvicorn main:app --reload

Once running, open:
Swagger UI: http://127.0.0.1:8000/docs 


#   To run tests

PYTHONPATH=. pytest


#   To run frontend

1. cd frontend

2. npm install

3. npm run dev

Once running, open:
React UI: http://localhost:5173



#  How to implement each request and what to expect in various cases

- get_sensors : does not need any parameter and will return all the sensors in the database in JSON format like below:


- get_sensor_by_id : user inserts an integer which represent the sensor id he is looking for and the execution will return the data stored for this sensor in JSON format like below:
    {
    "sensorId": 1,
    "type": "Temperature",
    "vendorName": "Bosch",
    "vendorEmail": "bosch@sensors.com",
    "description": "Temperature sensor",
    "location": "Room A"
    }


- get_readings : does not need any parameter and will return all the readings in the database or a message Sensor not found if there isn't a sensor with this id in the database. 


- add_sensor : user gives sensor data (id, type, vendor's name, vendor's email, a description and    the sensor's location).
    {
    "sensorId": 1,
    "type": "Temperature",
    "vendorName": "Bosch",
    "vendorEmail": "bosch@sensors.com",
    "description": "Main sensor",
    "location": "Room A"
    }
    A message saying "Sensor added successfully" will appear if the task was done or "Sensor with this ID already exists" if sensor with this ID already exists in the database.
    {
    "message": "Sensor added successfully"
    }



- add_reading : expects a reading insert by the user (including id, the sensor's id, the reading's type, the value it measure, the date the measurement took place and the ). 
    {
    "id": 1,
    "sensorId": 1,
    "readingType": "Temperature",
    "readingValue": 23.5,
    "readingDate": "2025-02-12",
    "readingTime": "14:32:00",
    "description": "Normal temperature"
    }

    A message "Reading with this ID already exists" if the id is already used by an other reading saved in the database and so the user should type a different one.
    {
    "message": "Reading added successfully"
    }



# UI is split in

1. Container components
    - Sensors.jsx
    - Readings.jsx

2.  UI components
    - SensorForm.jsx
    - SensorList.jsx
    - ReadingForm.jsx
    - ReadingList.jsx

Τα API calls βρίσκονται μόνο στα container components.


WEB-FRAMEWORK SELECTION:
For the implementation of REST API, I chose fastAPI for web framework, because - as a begginer in API's logic - is easy to learn , easy to develop with, as it reduces a significant part of human error and by reviews i read is also high performance, but i didn't test that. Also a huge advantage for me was the swagger UI feature that fastAPI provides that gave me the opportunity to test the responses of my requests without having to also create the front end, unlike flask or django.

LANGUAGE SELECTION:
The main programming language i used for the assingment was Python as it is simple, with many healpfull libraries and also works great with fastAPI. More specifically, i load my packages for the project in python Virtual Machine so it can run in other machines as well, not have to deal with conflict due to updates and also reduse the disk storage.

DATABASE LANGUAGE:
For the database implementation i used postgreSQL. Even if it would be easier for me to just use SQLite that doesn't need installation and connection with server unlike postgreSQL, all in all postegreSQL can handle more advanced queries and is a real production database. For easier develop i combine postgreSQL with SQLALchemy that can convert the python classes in the database tables making the queries easier to implement.

OS SELECTION:
I run the project in Linux using WSL for compatibility with other machines and better performance.

Re-render όταν αλλάζουν δεδομένα
FRONT END SELECTION:
The front end is implemented by React + Vite. Because React give you tools like useState hook to keep sensors and readings, useEffect hook to fetch data from the API and components. Without those tools the implementation would had to be manual.Also used with Axios for HTTP client that works very good with API projects as it auto-parses JSON format and provides error handling.
