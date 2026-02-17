from models import SensorReading
from datetime import date, time, timedelta
import random
from sampledata.sensors import Sensors

# Dictionary to map sensor id with each location value
sensor_location = {s.sensorId: s.location for s in Sensors}

Readings = []

# Generate readings for 15 sensors over 10 days
reading_id = 1
start_date = date(2025, 2, 1)
days = 10
locationId = (reading_id-1) % 5

for day in range(days):
    current_date = start_date + timedelta(days=day)
    for sensor_id in range(1, 16):

        # Determine reading type based on sensor_id
        if 1 <= sensor_id <= 5:
            reading_type = "Temperature"
            value = round(random.uniform(18.0, 25.0), 1)
        elif 6 <= sensor_id <= 10:
            reading_type = "Humidity"
            value = round(random.uniform(45.0, 60.0), 1)
        else:
            reading_type = "Acoustic"
            value = round(random.uniform(60.0, 75.0), 1)


        location = sensor_location[sensor_id]
        

        # Random times for morning, noon, evening
        for hour in [9, 12, 15]:
            reading = SensorReading(
                id=reading_id,
                sensorId=sensor_id,
                readingType=reading_type,
                readingValue=round(value + random.uniform(-1, 1), 1),  # small random variation
                readingDate=current_date,
                readingTime=time(hour, random.randint(0, 59)),
                description=f"{reading_type} in {location} "
            )
            Readings.append(reading)
            reading_id += 1

