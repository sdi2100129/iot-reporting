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
    db.query(db_models.Sensor).delete()
    db.query(db_models.SensorReading).delete()
    db.commit()
    db.close()
    yield


def test_create_sensor(clean_db):
    sensor_data = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"
    }
    response = client.post("/sensor/", json=sensor_data)

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
    response2 = client.post("/sensor/", json=sensor_data)

    # Expect a 400 error for duplicate
    assert response2.status_code == 400
    assert response2.json() == {"detail": "Sensor with this ID already exists"}


def test_invalid_email(clean_db):
    payload = {
        "sensorId": 101,
        "type": "Temperature",
        "vendorName": "Bad Vendor",
        "vendorEmail": "notanemail",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=payload)
    assert response.status_code == 422
    
    assert response.json()["detail"][0]["loc"] == ["body", "vendorEmail"]
    assert "value is not a valid email address" in response.json()["detail"][0]["msg"]

def test_invalid_vendor_name(clean_db):
    payload = {
        "sensorId": 102,
        "type": "Humidity",
        "vendorName": "Vendor123",
        "vendorEmail": "vendor123@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "vendorName"]


def test_invalid_sensor_type(clean_db):
    payload = {
        "sensorId": 103,
        "type": "InvalidType",
        "vendorName": "ValidVendor",
        "vendorEmail": "valid@example.com",
        "description": "Test",
        "location": "Lab"
    }

    response = client.post("/sensor/", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "type"]


#   Reading with wrong range
def test_temperature_out_of_range(clean_db):
    payload = {
        "id": 1,
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 500,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too hot"
    }

    response = client.post("/reading/", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]


def test_humidity_out_of_range(clean_db):
    payload = {
        "id": 2,
        "sensorId": 100,
        "readingType": "Humidity",
        "readingValue": 150,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too humid"
    }

    response = client.post("/reading/", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]


def test_acoustic_out_of_range(clean_db):
    payload = {
        "id": 3,
        "sensorId": 100,
        "readingType": "Acoustic",
        "readingValue": 300,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too loud"
    }

    response = client.post("/reading/", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "readingValue"]  


def test_future_reading_date(clean_db):
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

