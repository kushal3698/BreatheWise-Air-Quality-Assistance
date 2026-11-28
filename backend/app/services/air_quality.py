"""
Backward-compatible facade for modular air quality services:
  - cpcb_math.py: CPCB NAQI sub-index & category calculations
  - diurnal_forecaster.py: 6-pollutant hourly forecast & safe window derivation
  - open_meteo_client.py: Open-Meteo HTTP client, TTL cache, and offline demo fallback
"""

from app.services.cpcb_math import (
    CPCB_BREAKPOINTS,
    calculate_cpcb_aqi,
    calculate_sub_index,
    get_aqi_category_and_color,
)
from app.services.diurnal_forecaster import _build_hourly_forecast, compute_safe_windows
from app.services.open_meteo_client import (
    _CACHE,
    _assemble_live_payload,
    _fetch_open_meteo_raw,
    fetch_air_quality,
    load_demo_aqi,
)

__all__ = [
    "CPCB_BREAKPOINTS",
    "calculate_sub_index",
    "calculate_cpcb_aqi",
    "get_aqi_category_and_color",
    "_build_hourly_forecast",
    "compute_safe_windows",
    "_CACHE",
    "_fetch_open_meteo_raw",
    "_assemble_live_payload",
    "load_demo_aqi",
    "fetch_air_quality",
]
