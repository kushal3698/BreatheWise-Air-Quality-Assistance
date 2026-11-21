import pytest
from app.services.safety import get_safety_cautions, STANDARD_DISCLAIMER
from app.models.schemas import HouseholdProfile, HouseholdMember

def test_safety_cautions_for_asthma_and_high_aqi():
    hh = HouseholdProfile(
        members=[
            HouseholdMember(role="child", age=8),
            HouseholdMember(role="adult", age=36, sensitivities=["asthma"])
        ]
    )
    cautions = get_safety_cautions(aqi=285, category="Very Poor", household=hh)
    
    assert any("asthma" in c.lower() or "inhaler" in c.lower() for c in cautions)
    assert any("child" in c.lower() for c in cautions)
    assert "medical device" in STANDARD_DISCLAIMER.lower()
