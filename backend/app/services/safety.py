from typing import Any, Dict, List, Optional

from app.models.schemas import HouseholdProfile

STANDARD_DISCLAIMER: str = (
    "Estimates for awareness only. BreatheWise is a decision-support tool, not a medical device. "
    "For breathing difficulty, chest pain, or acute symptoms, consult a qualified physician immediately."
)


def get_safety_cautions(aqi: int, category: str, household: Optional[HouseholdProfile] = None) -> List[str]:
    """
    Evaluates health and vulnerability guardrails based on ambient AQI and household demographics.

    Args:
        aqi: Current or forecast CPCB AQI value (0-500).
        category: CPCB category label ('Good', 'Moderate', 'Poor', 'Very Poor', 'Severe').
        household: Optional profile detailing vulnerable members (children, elderly, asthma/COPD).

    Returns:
        List of actionable clinical precautions and safety warnings.
        Guarantees that an asthma caution banner is ALWAYS included if a sensitive member is present.
    """
    cautions: List[str] = []

    # 1. AQI Tier Checks
    if aqi > 400:
        cautions.append(
            "CRITICAL: Severe smog episode. Ground-level pollutants are dangerous to all individuals. Keep all outdoor activity suspended."
        )
    elif aqi > 300:
        cautions.append(
            "Very Poor air today. Microscopic particles (PM2.5) are heavily elevated. Keep doors and windows closed during peak smog."
        )
    elif aqi > 200:
        cautions.append(
            "Poor air quality: Sensitive individuals will experience respiratory discomfort. Strenuous outdoor cardio is not recommended."
        )

    # 2. Household Vulnerability Checks
    if household and household.members:
        has_asthma = any(
            any("asthma" in s.lower() or "copd" in s.lower() or "respiratory" in s.lower() for s in m.sensitivities)
            for m in household.members
        )
        has_child = any(m.role.lower() == "child" or m.age < 12 for m in household.members)
        has_elderly = any(m.role.lower() == "elderly" or m.age >= 65 for m in household.members)

        # Guardrail: Asthma caution ALWAYS appears regardless of AQI if a sensitive member is in the household
        if has_asthma:
            cautions.append(
                "One or more household members have respiratory sensitivities (asthma/COPD): Keep prescribed fast-acting reliever inhalers within immediate reach."
            )
        if has_child and aqi > 200:
            cautions.append(
                "Young children in household: Developing lungs are vulnerable to ultrafine particles. Ensure recess and sports remain indoors today."
            )
        if has_elderly and aqi > 200:
            cautions.append(
                "Elderly family members: High PM2.5 elevates cardiovascular strain. Substitute morning walks with indoor mobility exercises."
            )

    return cautions


def enforce_plan_guardrails(
    plan: Dict[str, Any],
    aqi: int,
    category: str,
    household: Optional[HouseholdProfile] = None,
) -> Dict[str, Any]:
    """
    Applies provider-independent safety guarantees to a generated plan.

    Whatever provider produced the plan (rule-based or LLM), the returned plan always
    contains the deterministic safety cautions (asthma caution, AQI tier warnings) and
    the standard non-medical disclaimer. Provider-written cautions are kept after the
    mandatory ones, with duplicates removed.
    """
    required = get_safety_cautions(aqi, category, household)
    extra = [c for c in plan.get("cautions", []) if c not in required]
    plan["cautions"] = required + extra
    if not plan.get("disclaimer"):
        plan["disclaimer"] = STANDARD_DISCLAIMER
    return plan
