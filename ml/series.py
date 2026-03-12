# ml/series.py
import pandas as pd
from datetime import datetime

def _normalize_freq(freq: str) -> str:
    # pandas prefers lower-case units like "h", "min", "s". Allow users to send "2H", "15MIN", etc.
    if not freq:
        return "2h"
    return freq.strip().replace("H", "h").replace("MIN", "min").replace("S", "s")

def build_series_from_rows(rows, freq="2h"):
    freq = _normalize_freq(freq)

    data = []
    for r in rows:
        reading_date = getattr(r, "readingDate", None)
        reading_time = getattr(r, "readingTime", None)
        reading_value = getattr(r, "readingValue", None)

        ts = datetime.combine(reading_date, reading_time)
        data.append((ts, float(reading_value)))

    if not data:
        raise ValueError("No data points found for requested filters.")

    df = pd.DataFrame(data, columns=["timestamp", "value"]).sort_values("timestamp")
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    s = df.set_index("timestamp")["value"]

    # UCI data can produce duplicate timestamps — we collapse them before asfreq
    s = s.groupby(s.index).mean()

    s = s.asfreq(freq).interpolate()
    return s