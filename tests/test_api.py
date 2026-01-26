from fastapi.testclient import TestClient
from main import app

#   Create a fake server in memory.
client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}


def test_create_sensor():
    sensor_data = {
        "sensorId": 1,
        "type": "Temperature",
        "vendorName": "SensorCo",
        "vendorEmail": "SensorCo@example.com",
        "description": "Outdoor temperature sensor",
        "location": "Rooftop"
    }
    response = client.post("/sensors/", json=sensor_data)
    assert response.status_code == 200
    assert response.json() == sensor_data   


def test_invalid_email():
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


#   Reading with wrong range
def test_temperature_out_of_range():
    payload = {
        "sensorId": 100,
        "readingType": "Temperature",
        "readingValue": 500,
        "readingDate": "2024-01-01",
        "readingTime": "12:00:00",
        "description": "Too hot"
    }

    response = client.post("/reading/", json=payload)
    assert response.status_code == 422

