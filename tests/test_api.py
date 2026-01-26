from fastapi.testclient import TestClient
import pytest
from database import SessionLocal
import db_models
from main import app

#   Create a fake server in memory.
client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}


@pytest.fixture
def clean_db():
    db = SessionLocal()
    db.query(db_models.SensorReading).delete()
    db.query(db_models.Sensor).delete()
    db.commit()
    db.close()
    yield


def test_create_sensor(clean_db):
    sensor = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"
    }
    response = client.post("/sensor/", json=sensor)

    expected_response = {
        "message": "Sensor added successfully",
        "sensorId": 1,
        "sensorType": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"
    }
    assert response.status_code == 200
    assert response.json() == expected_response  

    # Try to add the same sensor again
    response2 = client.post("/sensor/", json=sensor)

    # Expect a 400 error for duplicate
    assert response2.status_code == 400
    assert response2.json() == {"detail": "Sensor with this ID already exists"}


def test_invalid_vendorEmail(clean_db):
    sensor = {
        "sensorId": 101,
        "type": "Temperature",
        "vendorName": "Bad Vendor",
        "vendorEmail": "notanemail",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=sensor)
    assert response.status_code == 422
    
    assert response.json()["detail"][0]["loc"] == ["body", "vendorEmail"]
    assert "value is not a valid email address" in response.json()["detail"][0]["msg"]

def test_invalid_vendorName(clean_db):
    sensor = {
        "sensorId": 102,
        "type": "Humidity",
        "vendorName": "Vendor123",
        "vendorEmail": "vendor123@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=sensor)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "vendorName"]


def test_invalid_sensor_type(clean_db):
    sensor = {
        "sensorId": 103,
        "type": "InvalidType",
        "vendorName": "ValidVendor",
        "vendorEmail": "valid@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=sensor)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "type"]

def test_missing_fields_sensor(clean_db):
    sensor = {
        "sensorId": 104,
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=sensor)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "type"]


def test_create_reading(clean_db):
    sensor = {
        "sensorId": 100,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"   
    }
    client.post("/sensor/", json=sensor)

    reading = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 25.5,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Normal reading"
    }
    response = client.post("/reading/", json=reading)
    assert response.status_code == 200
    assert response.json() == {
        "message": "Reading added successfully",
        "id": 1,
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 25.5,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Normal reading"
    }

    response = client.post("/reading/", json=reading)
    assert response.status_code == 400
    assert response.json() == {"detail": "Reading with this ID already exists"}


#   Reading with wrong range
def test_temperature_out_of_range(clean_db):
    reading = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 500,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too hot"
    }

    response = client.post("/reading/", json=reading)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]


def test_invalid_humidity(clean_db):
    reading = {
        "id": 2,
        "sensorId": 100,
        "readingType": "Humidity",
        "readingValue": 150,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too humid"
    }

    response = client.post("/reading/", json=reading)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]


def test_invalid_acoustic(clean_db):
    reading = {
        "id": 3,
        "sensorId": 100,
        "readingType": "Acoustic",
        "readingValue": 300,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too loud"
    }

    response = client.post("/reading/", json=reading)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]  


def test_future_readingDate(clean_db):
    payload = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Humidity",
        "readingValue": 50,
        "readingDate": "2100-01-01",
        "readingTime": "12:00:00",
        "description": "Future date"
    }

    response = client.post("/reading/", json=payload)
    assert response.status_code == 422

    assert response.json()["detail"][0]["loc"] == ["body", "readingDate"]
    assert "readingDate cannot be in the future" in response.json()["detail"][0]["msg"]



def test_get_nonexistent_sensor(clean_db):
    sensor = {
        "sensorId": 11,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"
    }

    reading = {
        "id": 18,
        "sensorId": 123,
        "readingType": "Temperature",
        "readingValue": 20,
        "readingDate": "2000-01-01",
        "readingTime": "10:00:00",
        "description": "Morning reading"
    }

    client.post("/sensor/", json=sensor)
    response = client.post("/reading/", json=reading)
    assert response.status_code == 404
    assert response.json() == {"detail": "Sensor does not exist"}


def test_invalid_reading_type(clean_db):
    sensor = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "sensor@example.com",
        "description": "Test sensor",
        "location": "Lab"
    }
    client.post("/sensor/", json=sensor)

    reading = {
        "id": 1,
        "sensorId": 1,
        "readingType": 233,   # integer αντί για string
        "readingValue": 25,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Invalid type"
    }

    response = client.post("/reading/", json=reading)

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingType"]
