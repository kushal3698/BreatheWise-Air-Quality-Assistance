from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.services.cpcb_math import calculate_cpcb_aqi, get_aqi_category_and_color


def _pick_hourly_value(series: List[Any], idx: int, default: Optional[float] = None) -> Optional[float]:
    """Safely index an Open-Meteo hourly pollutant series with fallback."""
    if idx < len(series) and series[idx] is not None:
        return float(series[idx])
    return default


def _build_hourly_forecast(
    hourly: Dict[str, Any],
    default_pm25: float,
    default_pm10: float,
) -> List[Dict[str, Any]]:
    """Parse 2-hourly Open-Meteo 6-pollutant telemetry into CPCB AQI forecast slots."""
    times = hourly.get("time", [])
    h_pm25 = hourly.get("pm2_5", [])
    h_pm10 = hourly.get("pm10", [])
    h_no2 = hourly.get("nitrogen_dioxide", [])
    h_so2 = hourly.get("sulphur_dioxide", [])
    h_co = hourly.get("carbon_monoxide", [])
    h_o3 = hourly.get("ozone", [])

    forecast_items: List[Dict[str, Any]] = []
    for i in range(0, min(len(times), 24), 2):
        t_str = str(times[i])
        hour_label = t_str.split("T")[-1][:5] if "T" in t_str else f"{i:02d}:00"
        val_25 = _pick_hourly_value(h_pm25, i, default_pm25) or default_pm25
        val_10 = _pick_hourly_value(h_pm10, i, default_pm10) or default_pm10
        val_no2 = _pick_hourly_value(h_no2, i)
        val_so2 = _pick_hourly_value(h_so2, i)
        val_co_raw = _pick_hourly_value(h_co, i)
        val_co = round(val_co_raw / 1000.0, 2) if val_co_raw is not None else None
        val_o3 = _pick_hourly_value(h_o3, i)

        h_aqi = calculate_cpcb_aqi(
            pm2_5=val_25,
            pm10=val_10,
            no2=val_no2,
            so2=val_so2,
            co=val_co,
            o3=val_o3,
        )
        forecast_items.append({"hour": hour_label, "aqi": h_aqi, "pm2_5": round(val_25, 1)})
    return forecast_items


def compute_safe_windows(hourly_forecast: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Identify lowest-AQI 3-hour daylight safe windows directly from forecast AQI curve."""
    if not hourly_forecast or len(hourly_forecast) < 4:
        return []

    daylight = [item for item in hourly_forecast if 7 <= int(str(item["hour"]).split(":")[0]) <= 20]
    if len(daylight) < 3:
        daylight = hourly_forecast

    w_size = 3
    window_candidates: List[Dict[str, Any]] = []
    for i in range(len(daylight) - w_size + 1):
        window = daylight[i : i + w_size]
        avg_aqi = int(sum(int(w["aqi"]) for w in window) / w_size)
        window_candidates.append(
            {
                "start": window[0]["hour"],
                "end": window[-1]["hour"],
                "avg_aqi": avg_aqi,
            }
        )

    window_candidates.sort(key=lambda x: int(x["avg_aqi"]))
    if not window_candidates:
        return []

    best = window_candidates[0]
    best_avg = int(best["avg_aqi"])
    cat, _ = get_aqi_category_and_color(best_avg)
    guidance = f"Lowest forecast AQI today (~{best_avg}) from atmospheric dispersion forecast."
    if best_avg > 200:
        guidance += " Still in Poor/Very Poor range; keep outdoor duration short and wear N95."
    else:
        guidance += " Suitable for errands, school transport or short outdoor exercise."

    safe_windows: List[Dict[str, Any]] = [
        {
            "start": best["start"],
            "end": best["end"],
            "avg_aqi": best_avg,
            "category": cat,
            "guidance": guidance,
        }
    ]

    for cand in window_candidates[1:]:
        if abs(int(str(cand["start"]).split(":")[0]) - int(str(best["start"]).split(":")[0])) >= 4:
            cand_avg = int(cand["avg_aqi"])
            c_cat, _ = get_aqi_category_and_color(cand_avg)
            safe_windows.append(
                {
                    "start": cand["start"],
                    "end": cand["end"],
                    "avg_aqi": cand_avg,
                    "category": c_cat,
                    "guidance": "Alternative window for brief transit or household ventilation.",
                }
            )
            break

    return safe_windows
