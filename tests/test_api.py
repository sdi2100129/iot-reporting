"""
Integration tests for the IoT Reporting API.

This test suite verifies:
- Sensor creation and validation rules.
- Reading creation and business constraints.
- Schema-level validation enforced by Pydantic.
- Proper HTTP status codes and error messages.

All tests use a clean database state via fixtures.
"""

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
    """
    Provides a clean database state before each test.

    Deletes all SensorReading and Sensor records to ensure
    test isolation and deterministic results.
    """

    db = SessionLocal()
    db.query(db_models.SensorReading).delete()
    db.query(db_models.Sensor).delete()
    db.commit()
    db.close()
    yield


def test_create_sensor(clean_db):
    """
    Creating a sensor with a unique ID should succeed,
    while creating a duplicate sensor should fail.
    """

    sensor = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"
    }
    response = client.post("/sensors/", json=sensor)

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
    response2 = client.post("/sensors/", json=sensor)

    # Expect a 400 error for duplicate
    assert response2.status_code == 400
    assert response2.json() == {"detail": "Sensor with this ID already exists"}


def test_invalid_vendorEmail(clean_db):
    """
    Sensor creation should fail if vendorEmail is not a valid email address.
    Valid does not confirm existing, only format.
    """

    sensor = {
        "sensorId": 101,
        "type": "Temperature",
        "vendorName": "Bad Vendor",
        "vendorEmail": "notanemail",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensors/", json=sensor)
    assert response.status_code == 422
    
    assert response.json()["detail"][0]["loc"] == ["body", "vendorEmail"]
    assert "value is not a valid email address" in response.json()["detail"][0]["msg"]

def test_invalid_vendorName(clean_db):
    """
    Sensor creation should fail if vendorName contains invalid characters.
    """

    sensor = {
        "sensorId": 102,
        "type": "Humidity",
        "vendorName": "Vendor123",
        "vendorEmail": "vendor123@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensors/", json=sensor)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "vendorName"]


def test_invalid_sensor_type(clean_db):
    """
    Sensor creation should fail if the sensor type is not one of the allowed values.
    """

    sensor = {
        "sensorId": 103,
        "type": "InvalidType",
        "vendorName": "ValidVendor",
        "vendorEmail": "valid@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensors/", json=sensor)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "type"]


def test_missing_fields_sensor(clean_db):
    """
    Sensor creation should fail if required fields are missing.
    """

    sensor = {
        "sensorId": 104,
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensors/", json=sensor)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "type"]


def test_create_reading(clean_db):
    """
    Creating a valid sensor reading should succeed.
    Creating a reading with a duplicate ID should fail.
    """

    sensor = {
        "sensorId": 100,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"   
    }
    client.post("/sensors/", json=sensor)

    reading = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 25.5,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Normal reading"
    }
    response = client.post("/readings/", json=reading)
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

    response = client.post("/readings/", json=reading)
    assert response.status_code == 400
    assert response.json() == {"detail": "Reading with this ID already exists"}


#   Reading with wrong range
def test_temperature_out_of_range(clean_db):
    """
    Reading values must be within the valid range for the sensor type.
    """

    reading = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 500,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too hot"
    }

    response = client.post("/readings/", json=reading)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]


def test_invalid_humidity(clean_db):
    """
    Humidity readings must be between 0 and 100.
    """ 

    reading = {
        "id": 2,
        "sensorId": 100,
        "readingType": "Humidity",
        "readingValue": 150,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too humid"
    }

    response = client.post("/readings/", json=reading)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]


def test_invalid_acoustic(clean_db):
    """
    Acoustic readings must be between 0 and 200.
    """

    reading = {
        "id": 3,
        "sensorId": 100,
        "readingType": "Acoustic",
        "readingValue": 300,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too loud"
    }

    response = client.post("/readings/", json=reading)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]  


def test_future_readingDate(clean_db):
    """
    Reading dates must not be in the future.
    """
    
    payload = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Humidity",
        "readingValue": 50,
        "readingDate": "2100-01-01",
        "readingTime": "12:00:00",
        "description": "Future date"
    }

    response = client.post("/readings/", json=payload)
    assert response.status_code == 422

    assert response.json()["detail"][0]["loc"] == ["body", "readingDate"]
    assert "readingDate cannot be in the future" in response.json()["detail"][0]["msg"]



def test_get_nonexistent_sensor(clean_db):
    """
    Test that retrieving a non-existent sensor returns a 404 error.
    """

    reading = {
        "id": 18,
        "sensorId": 123,
        "readingType": "Temperature",
        "readingValue": 20,
        "readingDate": "2000-01-01",
        "readingTime": "10:00:00",
        "description": "Morning reading"
    }

    response = client.post("/readings/", json=reading)
    assert response.status_code == 404
    assert response.json() == {"detail": "Sensor does not exist"}

def test_mismatched_reading_type(clean_db):
    """
    Test that creating a reading with a readingType that does not match
    the sensor's type fails with a 422 error.
    """

    sensor = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "sensor@example.com",
        "description": "Test sensor",
        "location": "Lab"
    }
    client.post("/sensors/", json=sensor)

    reading = {
        "id": 1,
        "sensorId": 1,
        "readingType": "Humidity",
        "readingValue": 50,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Mismatched type"
    }

    response = client.post("/readings/", json=reading)
    assert response.status_code == 422
    assert response.json() == {"detail": "Reading type does not match sensor type"}


def test_invalid_reading_type(clean_db):
    """
    Test that creating a reading with an invalid readingType fails schema validation.
    readingType should be a string, not an integer.
    """

    sensor = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "sensor@example.com",
        "description": "Test sensor",
        "location": "Lab"
    }
    client.post("/sensors/", json=sensor)

    reading = {
        "id": 1,
        "sensorId": 1,
        "readingType": 233,   # integer αντί για string
        "readingValue": 25,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Invalid type"
    }

    response = client.post("/readings/", json=reading)

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingType"]
