from __future__ import annotations

import json
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

from app.config import settings
from app.models.schemas import HouseholdProfile
from app.services.impact import calculate_action_impact, calculate_overall_impact
from app.services.llm.base import BaseLLMProvider
from app.services.safety import STANDARD_DISCLAIMER, get_safety_cautions

AFTERNOON_DIP_FACTOR: float = 0.72
MORNING_PEAK_FACTOR: float = 1.30
EVENING_PEAK_FACTOR: float = 1.20


@lru_cache(maxsize=1)
def _load_templates() -> Dict[str, Any]:
    """Load localized chat and city template configuration from JSON."""
    template_path = settings.config_dir / "plan_templates.json"
    if template_path.exists():
        with template_path.open("r", encoding="utf-8") as fh:
            data: Dict[str, Any] = json.load(fh)
            return data
    return {}


def _get_metro_cities() -> frozenset[str]:
    metros = _load_templates().get("metro_cities", [])
    return frozenset(str(c).lower() for c in metros)


METRO_CITIES: frozenset[str] = _get_metro_cities()


def _detect_household_sensitivities(household: Optional[HouseholdProfile]) -> Tuple[bool, bool]:
    """Detect whether household has respiratory sensitivity or active air purifier."""
    has_asthma = False
    has_purifier = False
    if household:
        if household.members:
            has_asthma = any(
                any("asthma" in s.lower() or "copd" in s.lower() or "respiratory" in s.lower() for s in m.sensitivities)
                for m in household.members
            )
        if household.home:
            has_purifier = household.home.has_purifier
    return has_asthma, has_purifier


def _compute_diurnal_bounds(aqi: int, safe_windows: List[Dict[str, Any]]) -> Tuple[str, int, int, int]:
    """Compute afternoon safe window range and morning/evening peaks."""
    safe_start = "13:00"
    safe_end = "16:30"
    safe_aqi = round(aqi * AFTERNOON_DIP_FACTOR)
    if safe_windows:
        safe_start = str(safe_windows[0].get("start", "13:00"))
        safe_end = str(safe_windows[0].get("end", "16:30"))
        safe_aqi = int(safe_windows[0].get("avg_aqi", round(aqi * AFTERNOON_DIP_FACTOR)))
    safe_text = f"{safe_start} - {safe_end}"
    return safe_text, safe_aqi, round(aqi * MORNING_PEAK_FACTOR), round(aqi * EVENING_PEAK_FACTOR)


def _build_multilingual_summary(
    city: str,
    cat: str,
    aqi: int,
    peak_morning_aqi: int,
    safe_text: str,
    language: str,
    has_asthma: bool,
) -> str:
    """Build localized, vulnerability-aware daily air quality summary."""
    localized = _load_templates().get("summary_templates", {})
    if language in localized:
        return str(localized[language]).format(
            city=city, cat=cat, aqi=aqi, peak_morning_aqi=peak_morning_aqi, safe_text=safe_text
        )

    if has_asthma:
        return (
            f"Air in {city} is {cat} (AQI {aqi}), peaking at ~{peak_morning_aqi} during morning hours. "
            f"Asthma caution: keep intense cardio indoors and schedule outdoor activity during the afternoon safe window ({safe_text})."
        )
    if aqi > 200:
        return (
            f"Elevated {cat} pollution in {city} (AQI {aqi}) with morning peak ~{peak_morning_aqi}. "
            f"Shift intense workouts indoors; ventilate only during the afternoon safe window ({safe_text})."
        )
    if aqi > 100:
        return (
            f"Moderate air quality in {city} (AQI {aqi}) with morning peak ~{peak_morning_aqi}. "
            f"Keep intense cardio indoors and schedule outdoor recreation during the afternoon safe window ({safe_text})."
        )
    return (
        f"Satisfactory air in {city} (AQI {aqi}). "
        f"Favorable conditions across most hours; optimal outdoor window is {safe_text} during peak thermal dispersion."
    )


def _build_low_emission_routines(
    safe_text: str,
    peak_morning_aqi: int,
    is_metro: bool,
    pm25: float,
    household: Optional[HouseholdProfile],
) -> List[Dict[str, Any]]:
    """Build actionable low-emission routines for cardio and commute shifting."""
    commute_action = (
        "Shift peak commute (8–10 AM) to Metro or carpool"
        if is_metro
        else "Shift peak commute (8–10 AM) to public bus, shared transit, or carpool"
    )
    return [
        {
            "action": f"Schedule outdoor cardio during the afternoon safe window ({safe_text})",
            "why": f"Between 06:00 and 09:30 AM, AQI peaks at ~{peak_morning_aqi}. Deep breathing during morning cardio multiplies fine particle deposition in airways.",
            "effort": "low",
            "cost": "free",
            "impact": calculate_action_impact("exercise", pm25, household),
            "sources": ["kb/exercise_and_aqi.md"],
        },
        {
            "action": commute_action,
            "why": "Avoids sitting in bumper-to-bumper vehicle exhaust plumes and cuts daily tailpipe emissions.",
            "effort": "medium",
            "cost": "free",
            "impact": calculate_action_impact("commute", pm25, household),
            "sources": ["kb/sustainable_transport.md"],
        },
    ]


def _build_indoor_air_hacks(
    safe_text: str,
    safe_aqi: int,
    has_purifier: bool,
    pm25: float,
    household: Optional[HouseholdProfile],
) -> List[Dict[str, Any]]:
    """Build profile-aware indoor air quality interventions."""
    purifier_action = (
        "Run bedroom HEPA air purifier on medium/high during morning and evening peaks"
        if has_purifier
        else "Set up a HEPA purifier or assemble a DIY Corsi-Rosenthal filter box fan"
    )
    purifier_why = (
        "Filters >75% of fine particles from bedroom air during atmospheric inversion hours."
        if has_purifier
        else "A DIY Corsi-Rosenthal box (4x MERV-13 filters + box fan) achieves 350+ CFM CADR at ~₹3,500 INR, cutting indoor PM2.5 by over 70%."
    )
    return [
        {
            "action": f"Keep windows tightly shut during morning peak; cross-ventilate during {safe_text}",
            "why": f"Afternoon solar convection breaks the nocturnal boundary layer, dropping ambient PM2.5 to the daily low (~{safe_aqi}).",
            "effort": "low",
            "cost": "free",
            "impact": {"exposure_reduction_pct": 35.0, "confidence": "Modelled estimate"},
            "sources": ["kb/indoor_air_quality.md"],
        },
        {
            "action": purifier_action,
            "why": purifier_why,
            "effort": "medium",
            "cost": "free" if has_purifier else "low",
            "impact": calculate_action_impact("purifier", pm25, household),
            "sources": ["kb/indoor_air_quality.md"],
        },
        {
            "action": "Run kitchen exhaust for all cooking and avoid burning incense (agarbatti)",
            "why": "Cooking fumes and burning incense raise indoor PM2.5 above 400 µg/m³ in enclosed living rooms.",
            "effort": "low",
            "cost": "free",
            "impact": calculate_action_impact("cooking", pm25, household),
            "sources": ["kb/clean_cooking_and_heating.md"],
        },
    ]


def _build_sustainable_alternatives(pm25: float, household: Optional[HouseholdProfile]) -> List[Dict[str, Any]]:
    """Build sustainable transportation and errand consolidation options."""
    return [
        {
            "action": "Batch grocery and errand trips into a single midday route during the safe window",
            "why": "Avoids multiple cold engine starts and saves 60–70% of local vehicle emissions.",
            "effort": "low",
            "cost": "free",
            "impact": {
                "exposure_reduction_pct": 15.0,
                "co2_saved_kg": 2.1,
                "cost_saved_inr": 120.0,
                "confidence": "Modelled estimate",
            },
            "sources": ["kb/sustainable_transport.md"],
        },
        {
            "action": "Pool school runs or enroll in neighborhood school bus",
            "why": "Reduces localized tailpipe emissions right at school gates where children gather.",
            "effort": "medium",
            "cost": "free",
            "impact": calculate_action_impact("school", pm25, household),
            "sources": ["kb/school_and_community.md"],
        },
    ]


def _build_diurnal_timeline(
    safe_text: str, safe_aqi: int, peak_morning_aqi: int, peak_evening_aqi: int
) -> List[Dict[str, Any]]:
    """Build hour-by-hour operational timeline from diurnal meteorological curve."""
    morning_advice = (
        f"Morning peak (AQI up to ~{peak_morning_aqi}): ground inversion traps exhaust; keep workouts indoors."
        if peak_morning_aqi > 200
        else (
            f"Morning peak (AQI up to ~{peak_morning_aqi}): keep intense cardio indoors and reschedule morning walks."
            if peak_morning_aqi > 100
            else f"Mild morning peak (AQI ~{peak_morning_aqi}): safe for light outdoor walking; sensitive groups monitor symptoms."
        )
    )
    evening_advice = (
        f"Evening peak (AQI up to ~{peak_evening_aqi}): nocturnal cooling traps rush-hour particulate. Seal living spaces."
        if peak_evening_aqi > 150
        else (
            f"Moderate evening peak (AQI ~{peak_evening_aqi}): keep windows closed along busy roads; asthma members stay indoors."
            if peak_evening_aqi > 100
            else f"Pleasant evening hours (AQI ~{peak_evening_aqi}): safe for normal evening routines."
        )
    )
    return [
        {"time": "06:00 - 09:30", "advice": morning_advice},
        {
            "time": "09:30 - 13:00",
            "advice": "Commute window: keep car AC on recirculation mode and seal roadside windows.",
        },
        {
            "time": safe_text,
            "advice": f"Optimal safe window today (AQI drops to ~{safe_aqi}). Peak solar convection disperses surface pollutants. Best window for outdoor errands, exercise, and home ventilation.",
        },
        {"time": "18:00 - 22:00", "advice": evening_advice},
    ]


def _dispatch_chat_topic(
    msg_lower: str,
    city: str,
    cat: str,
    aqi: int,
    curr: Dict[str, Any],
    safe_summary: str,
) -> Tuple[str, List[str]]:
    """Synthesize grounded conversational response based on user inquiry topic."""
    suggestions: Dict[str, List[str]] = _load_templates().get("chat_suggestions", {})
    if any(k in msg_lower for k in ("play outside", "8-year-old", "child", "kid")):
        reply = (
            f"**Air today in {city} is {cat} (AQI {aqi}).**\n\n"
            f"**Recommendation: Do not allow your child to play vigorously outside this afternoon.**\n\n"
            f"- **Why:** Children's respiratory rates are significantly higher per kg of body weight, and developing alveoli are especially susceptible to permanent damage from sub-micron PM2.5.\n"
            f"- **Alternative:** If outdoor recess is unavoidable, restrict it to the safest window ({safe_summary}) for no more than 20–25 minutes of low-intensity play rather than active sprinting.\n"
            f"- **Estimated Impact:** Avoiding intense outdoor cardio saves ~60% to 75% acute fine particle alveolar deposition."
        )
        return reply, list(suggestions.get("child", []))

    if any(k in msg_lower for k in ("commute", "travel", "metro")):
        reply = (
            f"**Low-Emission Commute Plan for {city} (Current AQI: {aqi}, {cat}):**\n\n"
            f"1. **Switch to Metro / Underground Rail:** Cabin air in modern metro trains reduces direct exposure to roadside particulate spikes by ~40% compared to sitting in road congestion.\n"
            f"2. **If Driving a Car:** Keep all windows shut and switch vehicle air conditioning to **Recirculation mode**.\n"
            f"3. **Turn Off Engine at Signals:** Idling wastes fuel and emits toxic fumes at breathing height.\n\n"
            f"**Estimated Impact:** Shifting a 15 km car commute to the metro avoids **~2.3 kg of CO₂** and saves **~₹110 INR** in fuel per trip."
        )
        return reply, list(suggestions.get("commute", []))

    if any(k in msg_lower for k in ("purifier", "diy", "corsi")):
        return str(_load_templates().get("purifier_comparison_reply", "")), list(suggestions.get("purifier", []))

    if any(k in msg_lower for k in ("3-day", "plan")):
        reply = (
            f"**3-Day Low-Emission Family Resilience Plan for {city}:**\n\n"
            f"- **Day 1 (Sealing & Infiltration Control):** Check weatherstripping; shift morning jogging indoors; run HEPA filter or DIY box fan.\n"
            f"- **Day 2 (Mobility Optimization):** Carpool school drop-offs; consolidate shopping errands during the afternoon safe window ({safe_summary}).\n"
            f"- **Day 3 (Cooking & Indoor Source Reduction):** Keep kitchen exhaust fans on for 15 minutes post-cooking; avoid incense sticks and mosquito coils.\n\n"
            f"**Cumulative 3-day Impact:** Approximately **4.8 kg CO₂ avoided** and **~45% lower personal PM2.5 intake**."
        )
        return reply, list(suggestions.get("plan", []))

    reply = (
        f"Today in **{city}**, air quality is **{cat}** with an AQI of **{aqi}** (PM2.5: {curr.get('pm2_5', 'N/A')} µg/m³).\n\n"
        f"- **Current Guidance:** Keep non-essential outdoor travel minimal.\n"
        f"- **Safe Window:** {safe_summary if safe_summary else 'Mid-afternoon (1:00 PM – 4:00 PM) offers the lowest particulate levels today.'}\n"
        f"- **Action Tip:** Always use certified N95 respirators for outdoor transit; cloth masks do not filter fine PM2.5 particles."
    )
    return reply, list(suggestions.get("default", []))


def _localize_chat_reply(reply: str, language: str, city: str, cat: str, aqi: int) -> str:
    """Prepend regional localized headers for multi-lingual queries."""
    headers: Dict[str, str] = _load_templates().get("localized_chat_headers", {})
    if language in headers:
        return str(headers[language]).format(city=city, cat=cat, aqi=aqi) + reply
    return reply


class DemoLLMProvider(BaseLLMProvider):
    """Offline deterministic provider implementing grounded RAG answers and daily plans."""

    async def generate_plan(
        self,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
    ) -> Dict[str, Any]:
        curr = aqi_data.get("current", {})
        aqi = int(curr.get("aqi", 250))
        cat = str(curr.get("category", "Poor"))
        pm25 = float(curr.get("pm2_5", 150.0))
        safe_windows = aqi_data.get("safe_windows", [])

        has_asthma, has_purifier = _detect_household_sensitivities(household)
        is_metro = city.lower().strip() in METRO_CITIES
        safe_text, safe_aqi, peak_morning_aqi, peak_evening_aqi = _compute_diurnal_bounds(aqi, safe_windows)

        summary = _build_multilingual_summary(city, cat, aqi, peak_morning_aqi, safe_text, language, has_asthma)
        routines = _build_low_emission_routines(safe_text, peak_morning_aqi, is_metro, pm25, household)
        indoor_hacks = _build_indoor_air_hacks(safe_text, safe_aqi, has_purifier, pm25, household)
        sustainable_alts = _build_sustainable_alternatives(pm25, household)
        timeline = _build_diurnal_timeline(safe_text, safe_aqi, peak_morning_aqi, peak_evening_aqi)
        overall_impact = calculate_overall_impact(pm25, household)

        return {
            "summary": summary,
            "risk_level": cat.lower().replace(" ", "_"),
            "sections": {
                "low_emission_routines": routines,
                "indoor_air_hacks": indoor_hacks,
                "sustainable_alternatives": sustainable_alts,
            },
            "today_timeline": timeline,
            "impact_summary": overall_impact.model_dump(),
            "cautions": get_safety_cautions(aqi, cat, household),
            "disclaimer": STANDARD_DISCLAIMER,
        }

    async def generate_chat_reply(
        self,
        message: str,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        curr = aqi_data.get("current", {})
        aqi = int(curr.get("aqi", 250))
        cat = str(curr.get("category", "Poor"))
        safe_windows = aqi_data.get("safe_windows", [])
        safe_summary = (
            f"Best safe window today: {safe_windows[0]['start']} to {safe_windows[0]['end']} (AQI ~{safe_windows[0]['avg_aqi']})"
            if safe_windows
            else ""
        )
        sources = (
            [str(c["source"]) for c in rag_context]
            if rag_context
            else ["kb/indoor_air_quality.md", "kb/exercise_and_aqi.md"]
        )
        raw_reply, suggested = _dispatch_chat_topic(message.lower(), city, cat, aqi, curr, safe_summary)
        return {
            "reply": _localize_chat_reply(raw_reply, language, city, cat, aqi),
            "grounded_sources": list(set(sources))[:3],
            "suggested_questions": suggested,
            "safe_window_summary": safe_summary,
            "disclaimer": STANDARD_DISCLAIMER,
        }
