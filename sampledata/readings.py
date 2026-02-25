from models import SensorReading
from datetime import date, time, timedelta
import random
import math
from sampledata.sensors import Sensors

sensor_location = {s.sensorId: s.location for s in Sensors}
Readings = []

reading_id = 1
start_date = date(2025, 2, 1)
days = 10

for day in range(days):
    current_date = start_date + timedelta(days=day)

    # gradual warming trend
    daily_trend = day * 0.3  

    for sensor_id in range(1, 16):

        location = sensor_location[sensor_id]

        for hour in range(0, 24, 2):

            # --- TEMPERATURE SENSORS ---
            if 1 <= sensor_id <= 5:
                reading_type = "Temperature"

                # simulate daily sinusoidal cycle
                base_temp = 20 + 4 * math.sin((hour / 24) * 2 * math.pi)
                location_offset = (sensor_id % 5) * 0.5
                value = base_temp + daily_trend + location_offset
                value += random.uniform(-0.8, 0.8)

            # --- HUMIDITY SENSORS ---
            elif 6 <= sensor_id <= 10:
                reading_type = "Humidity"

                # inverse relation to temperature
                base_humidity = 60 - 5 * math.sin((hour / 24) * 2 * math.pi)
                value = base_humidity - daily_trend * 0.5
                value += random.uniform(-2, 2)

            # --- ACOUSTIC SENSORS ---
            else:
                reading_type = "Acoustic"

                # normal environment noise
                value = 65 + random.uniform(-5, 5)

                # introduce occasional spikes (anomalies)
                if random.random() < 0.05:
                    value += random.uniform(20, 35)

            reading = SensorReading(
                id=reading_id,
                sensorId=sensor_id,
                readingType=reading_type,
                readingValue=round(value, 1),
                readingDate=current_date,
                readingTime=time(hour, random.randint(0, 59)),
                description=f"{reading_type} in {location}"
            )

            Readings.append(reading)
            reading_id += 1