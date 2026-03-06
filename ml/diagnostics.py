# ml/diagnostics.py
import numpy as np
from statsmodels.tsa.stattools import adfuller, kpss
from statsmodels.tsa.statespace.sarimax import SARIMAX

def stationarity_tests(series):
    y = series.dropna()

    adf_stat, adf_p, *_ = adfuller(y)
    out = {
        "adf_stat": float(adf_stat),
        "adf_pvalue": float(adf_p),
        "adf_stationary": bool(adf_p < 0.05),  # H0 non-stationary
    }

    # KPSS sometimes fails on short series; handle safely
    try:
        kpss_stat, kpss_p, *_ = kpss(y, regression="c", nlags="auto")
        out.update({
            "kpss_stat": float(kpss_stat),
            "kpss_pvalue": float(kpss_p),
            "kpss_stationary": bool(kpss_p >= 0.05),  # H0 stationary
        })
    except Exception as e:
        out.update({
            "kpss_error": str(e),
        })

    return out

def quick_model_scores(series, seasonal_period=12):
    """
    Professional-lite: compare ARIMA vs SARIMA via AIC on same data.
    (Backtesting is better, but AIC is fast for a dashboard endpoint.)
    """
    y = series.dropna()

    # very conservative starter models
    arima = SARIMAX(y, order=(1,1,1), seasonal_order=(0,0,0,0),
                    enforce_stationarity=False, enforce_invertibility=False).fit(disp=False)

    sarima = SARIMAX(y, order=(1,1,1), seasonal_order=(1,1,1,seasonal_period),
                     enforce_stationarity=False, enforce_invertibility=False).fit(disp=False)

    return {
        "arima_aic": float(arima.aic),
        "sarima_aic": float(sarima.aic),
        "preferred_by_aic": "SARIMA" if sarima.aic < arima.aic else "ARIMA"
    }