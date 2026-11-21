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

def test_asthma_caution_banner_always_appears():
    """Verify that asthma caution ALWAYS appears if a sensitive member is in the household, even at Good AQI."""
    hh_asthma = HouseholdProfile(
        members=[
            HouseholdMember(role="adult", age=28, sensitivities=["asthma"])
        ]
    )
    # Even at AQI 25 (Good band)
    cautions_good = get_safety_cautions(aqi=25, category="Good", household=hh_asthma)
    assert any("asthma" in c.lower() or "inhaler" in c.lower() for c in cautions_good)

    # And at AQI 450 (Severe band)
    cautions_severe = get_safety_cautions(aqi=450, category="Severe", household=hh_asthma)
    assert any("asthma" in c.lower() or "inhaler" in c.lower() for c in cautions_severe)
    assert any("severe" in c.lower() for c in cautions_severe)

def test_no_asthma_caution_when_no_sensitivities():
    """Verify no asthma caution is added if members have no sensitivities."""
    hh_healthy = HouseholdProfile(
        members=[
            HouseholdMember(role="adult", age=30, sensitivities=[])
        ]
    )
    cautions = get_safety_cautions(aqi=45, category="Good", household=hh_healthy)
    assert not any("asthma" in c.lower() for c in cautions)
