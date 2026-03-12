from models import SensorReading
from datetime import date, time, timedelta
import random
import math
from sampledata.sensors import Sensors
from ucimlrepo import fetch_ucirepo


# ---------------------------------------------------------------------------
# UCI Dataset: Room Occupancy Estimation (id=864)
# Columns we use:
#   Date        - "YYYY-MM-DD HH:MM:SS"
#   S1_Temp, S2_Temp, S3_Temp, S4_Temp  - real temperature readings (°C)
#   S1_Sound, S2_Sound, S3_Sound, S4_Sound - real sound readings (volts, 0-1)
#   S1-S4 map to our 4 locations: Main Hall, Rooftop, Elevator, Lobby
#   Conference Room (sensor 5) gets a small offset from S1 — no 5th sensor in UCI
# ---------------------------------------------------------------------------


# fetch dataset
dataset = fetch_ucirepo(id=864)
# data (as pandas dataframes) 
df = dataset.data.features.copy()

import pandas as pd
# Parse datetime
df["Date"] = df["Date"].str.strip()
df["datetime"] = pd.to_datetime(df["Date"] + " " + df["Time"], format="%Y/%m/%d %H:%M:%S")
df = df.sort_values("datetime").reset_index(drop=True)

# UCI Sound columns are in volts (0.0 – 1.0).
# Convert to dB scale that matches our acoustic sensor range (60-95 dB).
# A simple linear map: 0V → 55dB, 1V → 95dB
def volts_to_db(v):
    return round(55 + float(v) * 40, 1)

# Map UCI sensor nodes → our locations and sensor IDs
# S1 → Main Hall    (temp sensor 1,  humidity 6,  acoustic 11)
# S2 → Rooftop      (temp sensor 2,  humidity 7,  acoustic 12)
# S3 → Elevator     (temp sensor 3,  humidity 8,  acoustic 13)
# S4 → Lobby        (temp sensor 4,  humidity 9,  acoustic 14)
# S5 → Conference Room (derived from S1 + small offset, sensor 5, 10, 15)

UCI_SENSOR_MAP = {
    1: {"temp_col": "S1_Temp", "sound_col": "S1_Sound", "location": "Main Hall"},
    2: {"temp_col": "S2_Temp", "sound_col": "S2_Sound", "location": "Rooftop"},
    3: {"temp_col": "S3_Temp", "sound_col": "S3_Sound", "location": "Elevator"},
    4: {"temp_col": "S4_Temp", "sound_col": "S4_Sound", "location": "Lobby"},
}

sensor_location = {s.sensorId: s.location for s in Sensors}
Readings = []
reading_id = 1

# ---------------------------------------------------------------------------
# UCI data has ~4 days at 30s intervals — that's ~11,520 rows.
# We'll resample to one reading per 2 hours to match our existing schema,
# keeping only the rows closest to each 2-hour mark.
# ---------------------------------------------------------------------------

# Build a set of target timestamps: every 2h across the UCI date range
start_dt = df["datetime"].min().replace(minute=0, second=0, microsecond=0)
end_dt   = df["datetime"].max()


target_times = pd.date_range(start=start_dt, end=end_dt, freq="2h")

# For each target time, find the closest actual row in UCI data
def nearest_row(target):
    idx = (df["datetime"] - target).abs().idxmin()
    return df.loc[idx]

# Precompute humidity from UCI CO2 (S5_CO2) as a proxy:
# Higher CO2 correlates with more people → more moisture → higher humidity.
# Scale CO2 (400-2000 ppm) → humidity (40-80 %).
def co2_to_humidity(co2):
    co2 = max(400, min(2000, float(co2)))
    return round(40 + (co2 - 400) / 1600 * 40, 1)

has_co2 = "S5_CO2" in df.columns

for ts in target_times:
    row = nearest_row(ts)
    reading_date = row["datetime"].date()
    reading_time = row["datetime"].time().replace(second=0, microsecond=0)

    # --- TEMPERATURE sensors 1-4 from real UCI data ---
    for sensor_id, meta in UCI_SENSOR_MAP.items():
        temp_val = round(float(row[meta["temp_col"]]), 1)

        Readings.append(SensorReading(
            id=reading_id,
            sensorId=sensor_id,
            readingType="Temperature",
            readingValue=temp_val,
            readingDate=reading_date,
            readingTime=reading_time,
            description=f"Temperature in {meta['location']}"
        ))
        reading_id += 1

    # --- TEMPERATURE sensor 5 (Conference Room): S1 + small offset ---
    conf_temp = round(float(row["S1_Temp"]) + random.uniform(0.3, 1.2), 1)
    Readings.append(SensorReading(
        id=reading_id,
        sensorId=5,
        readingType="Temperature",
        readingValue=conf_temp,
        readingDate=reading_date,
        readingTime=reading_time,
        description="Temperature in Conference Room"
    ))
    reading_id += 1

    # --- HUMIDITY sensors 6-10 ---
    # Derive from CO2 if available, otherwise simulate inverse of temperature
    for sensor_id, meta in UCI_SENSOR_MAP.items():
        humidity_sensor_id = sensor_id + 5  # 6, 7, 8, 9

        if has_co2:
            humidity_val = co2_to_humidity(row["S5_CO2"])
            humidity_val += random.uniform(-2, 2)  # small per-sensor noise
        else:
            temp_val = float(row[meta["temp_col"]])
            humidity_val = 80 - temp_val * 1.5 + random.uniform(-2, 2)

        humidity_val = round(max(20, min(95, humidity_val)), 1)

        Readings.append(SensorReading(
            id=reading_id,
            sensorId=humidity_sensor_id,
            readingType="Humidity",
            readingValue=humidity_val,
            readingDate=reading_date,
            readingTime=reading_time,
            description=f"Humidity in {meta['location']}"
        ))
        reading_id += 1

    # Humidity sensor 10 (Conference Room)
    conf_humidity = round(co2_to_humidity(row["S5_CO2"]) + random.uniform(-2, 2) if has_co2
                          else 60 + random.uniform(-3, 3), 1)
    Readings.append(SensorReading(
        id=reading_id,
        sensorId=10,
        readingType="Humidity",
        readingValue=conf_humidity,
        readingDate=reading_date,
        readingTime=reading_time,
        description="Humidity in Conference Room"
    ))
    reading_id += 1

    # --- ACOUSTIC sensors 11-15 from real UCI sound data ---
    for sensor_id, meta in UCI_SENSOR_MAP.items():
        acoustic_sensor_id = sensor_id + 10  # 11, 12, 13, 14
        db_val = volts_to_db(row[meta["sound_col"]])

        # Inject occasional anomaly spikes (5% chance) on top of real data
        if random.random() < 0.05:
            db_val = round(db_val + random.uniform(15, 25), 1)

        Readings.append(SensorReading(
            id=reading_id,
            sensorId=acoustic_sensor_id,
            readingType="Acoustic",
            readingValue=db_val,
            readingDate=reading_date,
            readingTime=reading_time,
            description=f"Acoustic in {meta['location']}"
        ))
        reading_id += 1

    # Acoustic sensor 15 (Conference Room): average of S1+S2 sound
    conf_db = volts_to_db((float(row["S1_Sound"]) + float(row["S2_Sound"])) / 2)
    if random.random() < 0.05:
        conf_db = round(conf_db + random.uniform(15, 25), 1)
    Readings.append(SensorReading(
        id=reading_id,
        sensorId=15,
        readingType="Acoustic",
        readingValue=conf_db,
        readingDate=reading_date,
        readingTime=reading_time,
        description="Acoustic in Conference Room"
    ))
    reading_id += 1