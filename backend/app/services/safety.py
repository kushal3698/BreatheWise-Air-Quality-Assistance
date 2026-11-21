from typing import List, Optional
from app.models.schemas import HouseholdProfile

STANDARD_DISCLAIMER = "Estimates for awareness only. BreatheWise is a decision-support tool, not a medical device. For breathing difficulty, chest pain, or acute symptoms, consult a qualified physician immediately."

def get_safety_cautions(
    aqi: int,
    category: str,
    household: Optional[HouseholdProfile] = None
) -> List[str]:
    cautions: List[str] = []
    
    # 1. AQI Level Checks
    if aqi >= 400:
        cautions.append("CRITICAL: Severe smog episode. Ground-level pollutants are dangerous to all individuals. Keep all outdoor activity suspended.")
    elif aqi >= 300:
        cautions.append("Very Poor air today. Microscopic particles (PM2.5) are heavily elevated. Keep doors and windows closed during peak smog.")
    elif aqi >= 200:
        cautions.append("Poor air quality: Sensitive individuals will experience respiratory discomfort. Strenuous outdoor cardio is not recommended.")

    # 2. Household Vulnerability Checks
    if household and household.members:
        has_asthma = any(
            any("asthma" in s.lower() or "copd" in s.lower() or "respiratory" in s.lower() for s in m.sensitivities)
            for m in household.members
        )
        has_child = any(m.role.lower() == "child" or m.age < 12 for m in household.members)
        has_elderly = any(m.role.lower() == "elderly" or m.age >= 65 for m in household.members)
        
        if has_asthma:
            cautions.append("One or more household members have respiratory sensitivities (asthma/COPD): Keep prescribed fast-acting reliever inhalers within immediate reach.")
        if has_child and aqi > 200:
            cautions.append("Young children in household: Developing lungs are vulnerable to ultrafine particles. Ensure recess and sports remain indoors today.")
        if has_elderly and aqi > 200:
            cautions.append("Elderly family members: High PM2.5 elevates cardiovascular strain. Substitute morning walks with indoor mobility exercises.")

    return cautions
