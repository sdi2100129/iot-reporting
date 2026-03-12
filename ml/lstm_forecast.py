import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense
from keras.optimizers import Adam

from functools import lru_cache
import hashlib

import time
from keras.callbacks import Callback
import tqdm as tqdm_module
from tqdm import tqdm

# Custom Keras callback that updates a tqdm bar each epoch
class TqdmProgressCallback(Callback):
    def __init__(self, epochs, location):
        super().__init__()
        self.epochs = epochs
        self.location = location
        self.pbar = None
        self.start_time = None

    def on_train_begin(self, logs=None):
        self.start_time = time.time()
        self.pbar = tqdm(
            total=self.epochs,
            desc=f"  LSTM [{self.location}]",
            unit="epoch",
            ncols=80,
            bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} epochs [{elapsed}<{remaining}, loss={postfix}]"
        )

    def on_epoch_end(self, epoch, logs=None):
        loss = logs.get("loss", 0)
        self.pbar.set_postfix_str(f"{loss:.4f}")
        self.pbar.update(1)

    def on_train_end(self, logs=None):
        elapsed = time.time() - self.start_time
        self.pbar.close()
        print(f"  ✓ [{self.location}] Training done in {elapsed:.1f}s")



# Cache store: { cache_key → forecast_rows }
_forecast_cache = {}

def _make_cache_key(series, steps, window_size, epochs):
    # Hash the series values + params into a unique key
    data_hash = hashlib.md5(series.values.tobytes()).hexdigest()[:12]
    return f"{data_hash}_{steps}_{window_size}_{epochs}"


# Converts one long series into many small supervised-learning examples.
def make_sequences(values, window_size):
    X, y = [], []
    # For example, with window_size=3, turns [10, 20, 30, 40] into:
    # X: [[10, 20, 30]]
    # y: [40]
    for i in range(len(values) - window_size):
        X.append(values[i:i + window_size])
        y.append(values[i + window_size])
    return np.array(X), np.array(y)


def lstm_forecast(series, steps=12, window_size=12, epochs=100, batch_size=8, location="unknown"):
    """
    series: pandas Series with datetime index
    steps: future points to forecast
    window_size: number of past observations used for each prediction
    """
    # Step 1 — clean the series
    y = series.dropna().astype(float)

    # Check cache first
    cache_key = _make_cache_key(y, steps, window_size, epochs)
    if cache_key in _forecast_cache:
        print(f" [{location}] Cache hit — skipping training")
        return _forecast_cache[cache_key]
    

    # Step 2 — check data size
    if len(y) <= window_size + 2:
        raise ValueError(
            f"Not enough data for LSTM. Need more than {window_size + 2} points, got {len(y)}."
        )
    
    print(f"\n LSTM Training — {location}")
    print(f"   Data points : {len(y)}")
    print(f"   Window size : {window_size}")
    print(f"   Epochs      : {epochs}")
    print(f"   Batch size  : {batch_size}")

    total_start = time.time()

    # Step 3 — convert the pandas series into a 2D NumPy array
    values = y.values.reshape(-1, 1)

    # Step 4 — normalize the values
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(values)

    # Step 5 — make training sequences
    X, target = make_sequences(scaled, window_size)

    # Step 6 — reshape for LSTM input
    X = X.reshape((X.shape[0], X.shape[1], 1))

    model = Sequential([
        # LSTM processes the input sequence step-by-step and internally
        # maintains hidden state and cell state (memory) across timesteps
        LSTM(32, input_shape=(window_size, 1)),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
    model.fit(X, target, epochs=epochs, batch_size=batch_size, verbose=0, 
              # suppress Keras default output
              callbacks=[TqdmProgressCallback(epochs, location)])  
    

    # recursive forecasting
    print(f"  → Generating {steps}-step forecast...")
    forecast_start = time.time()

    # Extracts the last window_size observations
    last_window = scaled[-window_size:].reshape(1, window_size, 1)
    preds_scaled = []

    for _ in range(steps):
        pred = model.predict(last_window, verbose=0)[0, 0]
        preds_scaled.append(pred)

        # Slide the window forward. Removes the oldest value and adds the new prediction.
        next_window = np.append(last_window[0, 1:, 0], pred)
        last_window = next_window.reshape(1, window_size, 1)

    # Convert predictions back to original scale
    preds = scaler.inverse_transform(np.array(preds_scaled).reshape(-1, 1)).flatten()

    # build future datetime index
    inferred_freq = pd.infer_freq(y.index)
    if inferred_freq is None:
        # fallback
        inferred_freq = "2h"

    future_index = pd.date_range(
        start=y.index[-1],
        periods=steps + 1,
        freq=inferred_freq
    )[1:]

    result = {
        "window_size": window_size,
        "epochs": epochs,
        "forecast": [
            {"datetime": str(ts), "forecast": round(float(pred), 2)}
            for ts, pred in zip(future_index, preds)
        ]
    }


    total_elapsed = time.time() - total_start
    print(f"  ✅ [{location}] Complete — total time: {total_elapsed:.1f}s\n")


    # Store in cache
    _forecast_cache[cache_key] = result
    return result