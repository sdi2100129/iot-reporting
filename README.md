# iot-reporting-api

A full-stack system for managing Sensors and Readings in an IoT environment,
including filtering, metrics, and CRUD(Create, Read, Update, Deleete) operations.
In FastAPI Create is done with POST request, Read is done with GET request, Update is done with PUT request and Delete with DELETE request.


## Features
- CRUD operations for sensors
- CRUD operations for sensor readings
- Search readings by type, location, and time
- Metrics endpoint (min, max, mean, top 10)
- Automatic API docs with Swagger


## Project structure

```
├── main.py                         # FastAPI application entrypoint
├── models.py                       # Pydantic models for request/response validation
├── db_models.py                    # SQLAlchemy models mapped to database tables
├── database.py                     # Database connection and session management
├── Dockerfile                      # Backend Dockerfile
├── docker-compose.yml
├── .dockerignnore
├── requirements.txt                # Python dependencies
│
├── tests/
│   ├──test_api.py                  # Unit tests for API endpoints
│
└── frontend/
    ├── src/
    │   ├── api.jsx
    │   ├── main.jsx
    │   ├── app.jsx
    │   ├── app.css
    │   ├── components/
    │   │   ├── Sensors/
    │   │   │   ├── Sensors.jsx
    │   │   │   ├── SensorForm.jsx
    │   │   │   ├── SensorList.jsx
    |   |   |   └──SensorSearch.jsx
    │   │   │── Readings/
    │   │   │   ├── Readings.jsx
    │   │   │   ├── ReadingForm.jsx
    │   │   │   └── ReadingList.jsx
    │   │   │   └── ReadingSearch.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Home.jsx
    │   │   ├── Metrics.jsx
    │   │   ├── NavBar.jsx
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   ├── package.json
    │   ├── vite.config.js

```

## Environment Setup

This project uses environment variables for sensitive data (database credentials).

For security reasons, the `.env` file is not included in the repository.


### Installation

1. Clone the repository
``` bash
git clone https://github.com/aorfanoudaki/iot-reporting-api.git
cd iot-reporting-api
```


2. Create your own .env file
``` bash
cp .env.example .env
```

3. Edit `.env` and enter your database credentials:
``` env 
DB_PASSWORD=your_database_password

SECRET_KEY=your_secret_key_here

GOOGLE_CLIENT_ID=your_google_client_id_here

VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### OPTION A: Run using Docker (Recommended)
Check if you have Docker using the command:

``` bash
docker --version
```

If not, install Docker app from:
https://www.docker.com/ .Then

4. Build and start containers:

``` bash
docker compose up --build
```

Access the applications:

Frontend (React UI): http://localhost

Backend (FastAPI Swagger UI): http://localhost:8000/docs


### Option B: Run locally without Docker
4. Create virtual environment:

``` bash
python -m venv venv
source venv/bin/activate
```

5. Install dependencies:

```bash
pip install -r requirements.txt
```


###   To run backend

```bash
uvicorn main:app --reload
```
Once running, open:
Swagger UI: http://127.0.0.1:8000/docs 



###   To run frontend

Install npm:

```bash
cd frontend
npm install
```

And run:

```bash
npm run dev
```

Once running, open:
React UI: http://localhost:5173



###   To run tests

```bash
PYTHONPATH=. pytest
```


##  How to implement each request and what to expect in various cases

- get_sensors : does not need any parameter and will return all the sensors in the database in JSON format like below;

```json
{
    "success": True,
    "count": len(db_sensors),
    "data": db_sensors
}
```

- get_sensor_by_id : user inserts an integer which represent the sensor id he is looking for and the execution will return the data stored for this sensor in JSON format like below:

```json
{
    "sensorId": 1,
    "type": "Temperature",
    "vendorName": "Bosch",
    "vendorEmail": "bosch@sensors.com",
    "description": "Temperature sensor",
    "location": "Room A"
}
```


- get_readings : does not need any parameter and will return all the readings in the database or a message Sensor not found if there isn't a sensor with this id in the database. 


- add_sensor : user gives sensor data (id, type, vendor's name, vendor's email, a description and    the sensor's location).
```json
{
    "sensorId": 1,
    "type": "Temperature",
    "vendorName": "Bosch",
    "vendorEmail": "bosch@sensors.com",
    "description": "Main sensor",
    "location": "Room A"
}
```

and the corresponding success notification message

```json
{
    "message": "Sensor added successfully"
}
```

- add_reading : expects a reading insert by the user like below; 

```json
{
    "id": 1,
    "sensorId": 1,
    "readingType": "Temperature",
    "readingValue": 23.5,
    "readingDate": "2025-02-12",
    "readingTime": "14:32:00",
    "description": "Normal temperature"
}
```
And if everything goes as expected it also returns the message;

```json
{
    "message": "Reading added successfully"
}
```




## Architecture

### Web Framework
The REST API is implemented using FastAPI, a modern Python web framework designed for building high-performance APIs. FastAPI provides automatic request validation, data serialization, and interactive API documentation via Swagger UI, which significantly improves development speed and reduces human error. The built-in documentation also enables efficient testing of endpoints without requiring a frontend during early development.

### Programming Language
The backend is written in Python due to its simplicity, strong ecosystem, and excellent compatibility with FastAPI.
The project dependencies are managed in a Python virtual environment, ensuring consistent package versions, isolation from system-wide installations, and portability across different machines.

### Database
The system uses PostgreSQL as its relational database. While lightweight alternatives such as SQLite could have been used, PostgreSQL was selected because it supports advanced queries, better concurrency, and production-grade reliability.
To simplify database interaction, SQLAlchemy is used as the Object-Relational Mapper (ORM), allowing Python classes to be mapped directly to database tables and enabling expressive, maintainable queries.

### Operating System
Development and testing are performed on Linux via WSL, providing better performance, compatibility, and consistency with production environments.

### Frontend
The frontend is built using React with Vite as the build tool. React enables efficient UI development through reusable components and state management via hooks such as useState and useEffect.
Data is fetched from the API using Axios, which provides automatic JSON parsing, simplified request handling, and built-in error handling, making it well-suited for API-driven applications.


#### UI
The UI uses Tailwind CSS, which provides:
- Inline styling directly in JSX, eliminating the need for separate CSS files
- Utilities for spacing, colors, fonts, shadows, grids, forms, cards, and tables
- Rapid development of modern, consistent interfaces

On top of Tailwind, the project uses a component library (shadcn/ui) to accelerate development of:
- Buttons
- Tables
- Forms
- Search components
- Dashboards

This combination significantly reduces development time and ensures a modern, professional look.



temperature = real

acoustic = transformed from real sound

humidity = synthetic proxy

locations = fictional mapping

Sensor data is based on the
UCI Room Occupancy Estimation dataset.

• collected from a real sensor testbed
• 7 sensor nodes transmitting every 30 seconds
• includes temperature, sound, light, CO2 and PIR sensors