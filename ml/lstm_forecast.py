import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense
from keras.optimizers import Adam

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


def lstm_forecast(series, steps=12, window_size=12, epochs=100, batch_size=8):
    """
    series: pandas Series with datetime index
    steps: future points to forecast
    window_size: number of past observations used for each prediction
    """
    # Step 1 — clean the series
    y = series.dropna().astype(float)

    # Step 2 — check data size
    if len(y) <= window_size + 2:
        raise ValueError(
            f"Not enough data for LSTM. Need more than {window_size + 2} points, got {len(y)}."
        )

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
        LSTM(32, input_shape=(window_size, 1)),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
    model.fit(X, target, epochs=epochs, batch_size=batch_size, verbose=0)

    # recursive forecasting
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

    forecast_rows = []
    for ts, pred in zip(future_index, preds):
        forecast_rows.append({
            "datetime": str(ts),
            "forecast": round(float(pred), 2)
        })

    return {
        "window_size": window_size,
        "epochs": epochs,
        "forecast": forecast_rows
    }