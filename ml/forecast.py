from statsmodels.tsa.statespace.sarimax import SARIMAX

def arima_forecast(series, steps=7, order=(1, 1, 1)):
    """
    Fits ARIMA(order) and returns forecast + confidence intervals.
    series: pandas Series with datetime index
    steps: number of future points
    """
    y = series.dropna()

    model = SARIMAX(
        y,
        order=order,
        seasonal_order=(0, 0, 0, 0),
        enforce_stationarity=False,
        enforce_invertibility=False
    )

    results = model.fit(disp=False)
    forecast_res = results.get_forecast(steps=steps)

    mean = forecast_res.predicted_mean
    ci = forecast_res.conf_int()

    forecast_rows = []
    for i in range(len(mean)):
        forecast_rows.append({
            "datetime": str(mean.index[i]),
            "forecast": round(float(mean.iloc[i]), 2),
            "lower": round(float(ci.iloc[i, 0]), 2),
            "upper": round(float(ci.iloc[i, 1]), 2),
        })

    return {
        "order": order,
        "aic": float(results.aic),
        "forecast": forecast_rows
    }