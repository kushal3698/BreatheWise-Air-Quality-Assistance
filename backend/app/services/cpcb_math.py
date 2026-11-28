from __future__ import annotations

from typing import Dict, List, Optional, Tuple

CPCB_BREAKPOINTS: Dict[str, List[Dict[str, float]]] = {
    "pm2_5": [
        {"c_low": 0, "c_high": 30, "i_low": 0, "i_high": 50},
        {"c_low": 31, "c_high": 60, "i_low": 51, "i_high": 100},
        {"c_low": 61, "c_high": 90, "i_low": 101, "i_high": 200},
        {"c_low": 91, "c_high": 120, "i_low": 201, "i_high": 300},
        {"c_low": 121, "c_high": 250, "i_low": 301, "i_high": 400},
        {"c_low": 250.1, "c_high": 380, "i_low": 401, "i_high": 500},
    ],
    "pm10": [
        {"c_low": 0, "c_high": 50, "i_low": 0, "i_high": 50},
        {"c_low": 51, "c_high": 100, "i_low": 51, "i_high": 100},
        {"c_low": 101, "c_high": 250, "i_low": 101, "i_high": 200},
        {"c_low": 251, "c_high": 350, "i_low": 201, "i_high": 300},
        {"c_low": 351, "c_high": 430, "i_low": 301, "i_high": 400},
        {"c_low": 430.1, "c_high": 600, "i_low": 401, "i_high": 500},
    ],
    "no2": [
        {"c_low": 0, "c_high": 40, "i_low": 0, "i_high": 50},
        {"c_low": 41, "c_high": 80, "i_low": 51, "i_high": 100},
        {"c_low": 81, "c_high": 180, "i_low": 101, "i_high": 200},
        {"c_low": 181, "c_high": 280, "i_low": 201, "i_high": 300},
        {"c_low": 281, "c_high": 400, "i_low": 301, "i_high": 400},
        {"c_low": 401, "c_high": 600, "i_low": 401, "i_high": 500},
    ],
    "so2": [
        {"c_low": 0, "c_high": 40, "i_low": 0, "i_high": 50},
        {"c_low": 41, "c_high": 80, "i_low": 51, "i_high": 100},
        {"c_low": 81, "c_high": 380, "i_low": 101, "i_high": 200},
        {"c_low": 381, "c_high": 800, "i_low": 201, "i_high": 300},
        {"c_low": 801, "c_high": 1600, "i_low": 301, "i_high": 400},
        {"c_low": 1601, "c_high": 2000, "i_low": 401, "i_high": 500},
    ],
    "co": [
        {"c_low": 0, "c_high": 1.0, "i_low": 0, "i_high": 50},
        {"c_low": 1.1, "c_high": 2.0, "i_low": 51, "i_high": 100},
        {"c_low": 2.1, "c_high": 10.0, "i_low": 101, "i_high": 200},
        {"c_low": 10.1, "c_high": 17.0, "i_low": 201, "i_high": 300},
        {"c_low": 17.1, "c_high": 34.0, "i_low": 301, "i_high": 400},
        {"c_low": 34.1, "c_high": 50.0, "i_low": 401, "i_high": 500},
    ],
    "o3": [
        {"c_low": 0, "c_high": 50, "i_low": 0, "i_high": 50},
        {"c_low": 51, "c_high": 100, "i_low": 51, "i_high": 100},
        {"c_low": 101, "c_high": 168, "i_low": 101, "i_high": 200},
        {"c_low": 169, "c_high": 208, "i_low": 201, "i_high": 300},
        {"c_low": 209, "c_high": 748, "i_low": 301, "i_high": 400},
        {"c_low": 749, "c_high": 1000, "i_low": 401, "i_high": 500},
    ],
}


def calculate_sub_index(conc: float, breakpoints: List[Dict[str, float]], round_conc: bool = True) -> int:
    """Compute a single pollutant sub-index via CPCB piecewise linear interpolation."""
    if conc <= 0:
        return 0
    c_eval: float = float(round(conc)) if round_conc else conc
    matched_bp: Optional[Dict[str, float]] = None
    for i, bp in enumerate(breakpoints):
        prev_high = breakpoints[i - 1]["c_high"] if i > 0 else 0
        if bp["c_low"] <= c_eval <= bp["c_high"] or prev_high < c_eval < bp["c_low"]:
            matched_bp = bp
            break

    if not matched_bp:
        if c_eval > breakpoints[-1]["c_high"]:
            return int(breakpoints[-1]["i_high"])
        return 0

    i_lo, i_hi = matched_bp["i_low"], matched_bp["i_high"]
    c_lo, c_high = matched_bp["c_low"], matched_bp["c_high"]
    if c_high == c_lo:
        return int(i_lo)
    val = ((i_hi - i_lo) / (c_high - c_lo)) * (c_eval - c_lo) + i_lo
    return min(500, max(0, round(val)))


def calculate_cpcb_aqi(
    pm2_5: Optional[float] = None,
    pm10: Optional[float] = None,
    no2: Optional[float] = None,
    so2: Optional[float] = None,
    co: Optional[float] = None,
    o3: Optional[float] = None,
    round_conc: bool = True,
) -> int:
    """Compute National Air Quality Index (NAQI) as max sub-index across monitored pollutants."""
    pollutants: Dict[str, Optional[float]] = {
        "pm2_5": pm2_5,
        "pm10": pm10,
        "no2": no2,
        "so2": so2,
        "co": co,
        "o3": o3,
    }
    sub_indices = [
        calculate_sub_index(float(val), CPCB_BREAKPOINTS[pol], round_conc=round_conc)
        for pol, val in pollutants.items()
        if val is not None and pol in CPCB_BREAKPOINTS
    ]
    return max(sub_indices) if sub_indices else 0


def get_aqi_category_and_color(aqi: int) -> Tuple[str, str]:
    """Map numeric CPCB AQI to official category label and accessible color hex."""
    if aqi <= 50:
        return "Good", "#2ecc71"
    if aqi <= 100:
        return "Satisfactory", "#27ae60"
    if aqi <= 200:
        return "Moderate", "#f39c12"
    if aqi <= 300:
        return "Poor", "#e67e22"
    if aqi <= 400:
        return "Very Poor", "#e74c3c"
    return "Severe", "#8e44ad"
