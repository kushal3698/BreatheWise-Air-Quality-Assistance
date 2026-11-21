import json
from pathlib import Path
from typing import Dict, Any, Optional
from app.config import settings
from app.models.schemas import HouseholdProfile, ImpactSummary

def load_json_config(filename: str) -> Dict[str, Any]:
    cfg_path = settings.config_dir / filename
    if cfg_path.exists():
        with open(cfg_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

EMISSION_CONFIG = load_json_config("emission_factors.json")
EXPOSURE_CONFIG = load_json_config("exposure_assumptions.json")

def calculate_action_impact(
    action_type: str,
    outdoor_pm25: float,
    household: Optional[HouseholdProfile] = None
) -> Dict[str, Any]:
    """
    Computes quantified impact for individual actions.
    """
    action_type = action_type.lower()
    
    if "exercise" in action_type or "jog" in action_type or "walk" in action_type:
        # Move morning run indoors: exposure reduction
        # Infiltration factor windows closed + filter: 0.20 vs outdoor 1.0
        exp_reduc = 65.0 if outdoor_pm25 > 150 else 40.0
        return {
            "exposure_reduction_pct": exp_reduc,
            "co2_saved_kg": 0.0,
            "cost_saved_inr": 0.0,
            "confidence": "Modelled estimate"
        }
        
    elif "commute" in action_type or "metro" in action_type or "bus" in action_type:
        commute_km = household.transport.commute_km if household else 15.0
        ef_car = EMISSION_CONFIG.get("emission_factors_kg_co2_per_km", {}).get("petrol_car", 0.170)
        ef_metro = EMISSION_CONFIG.get("emission_factors_kg_co2_per_km", {}).get("metro", 0.014)
        cost_car = EMISSION_CONFIG.get("cost_inr_per_km", {}).get("petrol_car", 9.5)
        cost_metro = EMISSION_CONFIG.get("cost_inr_per_km", {}).get("metro", 2.2)
        
        co2_saved = round(commute_km * (ef_car - ef_metro), 2)
        cost_saved = round(commute_km * (cost_car - cost_metro), 1)
        # Transit cabin air is filtered, saving exposure during bumper-to-bumper traffic
        return {
            "exposure_reduction_pct": 35.0,
            "co2_saved_kg": co2_saved,
            "cost_saved_inr": cost_saved,
            "confidence": "Modelled estimate"
        }
        
    elif "school" in action_type or "pool" in action_type:
        school_km = household.transport.school_run_km if household else 4.0
        ef_car = EMISSION_CONFIG.get("emission_factors_kg_co2_per_km", {}).get("petrol_car", 0.170)
        ef_bus = EMISSION_CONFIG.get("emission_factors_kg_co2_per_km", {}).get("bus", 0.022)
        co2_saved = round(school_km * 2 * (ef_car - ef_bus), 2)
        return {
            "exposure_reduction_pct": 20.0,
            "co2_saved_kg": co2_saved,
            "cost_saved_inr": 45.0,
            "confidence": "Modelled estimate"
        }
        
    elif "purifier" in action_type or "corsi" in action_type or "filter" in action_type:
        # Purifier / C-R box removes 70-85% of indoor PM2.5 in living space
        return {
            "exposure_reduction_pct": 75.0,
            "co2_saved_kg": 0.0,
            "cost_saved_inr": 0.0,
            "confidence": "Modelled estimate"
        }
        
    elif "cooking" in action_type or "induction" in action_type:
        return {
            "exposure_reduction_pct": 25.0,
            "co2_saved_kg": 0.4,
            "cost_saved_inr": 15.0,
            "confidence": "Modelled estimate"
        }

    return {
        "exposure_reduction_pct": 15.0,
        "co2_saved_kg": 0.5,
        "cost_saved_inr": 20.0,
        "confidence": "Modelled estimate"
    }

def calculate_overall_impact(
    outdoor_pm25: float,
    household: Optional[HouseholdProfile] = None
) -> ImpactSummary:
    """
    Computes household cumulative weekly/monthly before-vs-after savings.
    """
    mode = household.transport.mode if household else "petrol_car"
    commute_km = household.transport.commute_km if household else 15.0
    school_km = household.transport.school_run_km if household else 4.0
    wfh_days = household.work_from_home_days if household else 2
    has_purifier = household.home.has_purifier if household else False

    ef_mode = EMISSION_CONFIG.get("emission_factors_kg_co2_per_km", {}).get(mode, 0.170)
    ef_metro = EMISSION_CONFIG.get("emission_factors_kg_co2_per_km", {}).get("metro", 0.014)
    cost_mode = EMISSION_CONFIG.get("cost_inr_per_km", {}).get(mode, 9.5)
    cost_transit = EMISSION_CONFIG.get("cost_inr_per_km", {}).get("metro", 2.2)

    # Weekly CO2 avoided:
    # WFH savings (avoided trips) + 2 days public transport shift + carpooling school run
    wfh_km_saved = wfh_days * (commute_km * 2)
    modal_shift_km = 2 * (commute_km * 2)  # 2 days shifted to metro/bus
    school_km_saved = 5 * (school_km * 2) * 0.7  # 70% saved through pooling

    co2_saved_week = (
        (wfh_km_saved * ef_mode) +
        (modal_shift_km * max(0.0, ef_mode - ef_metro)) +
        (school_km_saved * max(0.0, ef_mode - 0.022))
    )
    
    # Monthly cost saved in INR:
    cost_saved_month = (
        (wfh_km_saved * cost_mode * 4.2) +
        (modal_shift_km * max(0.0, cost_mode - cost_transit) * 4.2)
    )

    # Exposure reduction %:
    # Blend of outdoor routine adjustments and indoor filtration
    base_exposure_reduc = 25.0
    if outdoor_pm25 > 150:
        base_exposure_reduc += 15.0
    if not has_purifier:
        # Recommending DIY filter or proper window scheduling yields high delta
        base_exposure_reduc += 12.0
    else:
        base_exposure_reduc += 8.0

    exposure_pct = min(68.0, round(base_exposure_reduc, 1))

    # Cigarettes equivalent avoided per day
    # rule: 22 µg/m3 PM2.5 over 24h = 1 cigarette
    pm25_avoided = outdoor_pm25 * (exposure_pct / 100.0)
    cig_equiv = round(pm25_avoided / 22.0, 1)

    return ImpactSummary(
        exposure_reduction_pct=exposure_pct,
        co2_avoided_kg_week=round(co2_saved_week, 1),
        cost_saved_inr_month=round(cost_saved_month, 0),
        cigarettes_avoided_day=max(0.1, cig_equiv),
        confidence="Modelled estimate"
    )
