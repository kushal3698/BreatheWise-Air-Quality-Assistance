from typing import List, Optional

from pydantic import BaseModel, Field

# --- Household Models ---


class HouseholdMember(BaseModel):
    id: Optional[str] = None
    role: str = Field(..., description="child | adult | elderly")
    age: int
    sensitivities: List[str] = Field(default_factory=list, description="e.g. asthma, allergies, hypertension")


class TransportProfile(BaseModel):
    mode: str = Field(
        default="petrol_car",
        description="petrol_car | diesel_car | ev_car | petrol_twowheeler | bus | metro | walking | bicycle",
    )
    vehicles: int = Field(default=1)
    school_run_km: float = Field(default=4.0)
    commute_km: float = Field(default=15.0)


class HomeProfile(BaseModel):
    type: str = Field(default="apartment", description="apartment | independent_house")
    floor: int = Field(default=3)
    has_purifier: bool = Field(default=False)
    cooking_fuel: str = Field(default="LPG", description="LPG | induction | wood | piped_gas")


class HouseholdProfile(BaseModel):
    members: List[HouseholdMember] = Field(default_factory=list)
    transport: TransportProfile = Field(default_factory=TransportProfile)
    home: HomeProfile = Field(default_factory=HomeProfile)
    work_from_home_days: int = Field(default=2)


# --- Air Quality Models ---


class AirQualityLocation(BaseModel):
    name: str
    state: Optional[str] = None
    country: str = "India"
    lat: float
    lon: float


class AirQualityStation(BaseModel):
    name: str
    distance_km: float


class CurrentAQI(BaseModel):
    aqi: int
    category: str
    cpcb_color: str
    pm2_5: float
    pm10: float
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None


class WeatherInfo(BaseModel):
    temp_c: float
    humidity: int
    wind_kmh: float
    wind_direction: Optional[str] = "NW"
    conditions: Optional[str] = "Hazy"


class HourlyForecast(BaseModel):
    hour: str
    aqi: int
    pm2_5: float


class SafeWindow(BaseModel):
    start: str
    end: str
    avg_aqi: int
    category: str
    guidance: str


class AirQualityResponse(BaseModel):
    location: AirQualityLocation
    station: AirQualityStation
    current: CurrentAQI
    weather: WeatherInfo
    forecast: List[HourlyForecast]
    safe_windows: List[SafeWindow]
    source: str
    fetched_at: str
    is_stale: bool = False


# --- Plan Models ---


class ActionImpact(BaseModel):
    exposure_reduction_pct: Optional[float] = None
    co2_saved_kg: Optional[float] = None
    cost_saved_inr: Optional[float] = None
    confidence: str = "Modelled estimate"


class PlanActionItem(BaseModel):
    action: str
    why: str
    effort: str = "low"  # low | medium | high
    cost: str = "free"  # free | low | medium | investment
    impact: ActionImpact
    sources: List[str] = Field(default_factory=list)


class PlanTimelineItem(BaseModel):
    time: str
    advice: str


class PlanSections(BaseModel):
    low_emission_routines: List[PlanActionItem] = Field(default_factory=list)
    indoor_air_hacks: List[PlanActionItem] = Field(default_factory=list)
    sustainable_alternatives: List[PlanActionItem] = Field(default_factory=list)


class ImpactSummary(BaseModel):
    exposure_reduction_pct: float
    co2_avoided_kg_week: float
    cost_saved_inr_month: float
    cigarettes_avoided_day: Optional[float] = 0.0
    confidence: str = "Modelled estimate"


class DailyPlanRequest(BaseModel):
    city: str = Field(default="Delhi", min_length=1, max_length=60, pattern=r"^[\w\s()\-.]+$")
    language: str = Field(default="en", pattern=r"^(en|hi|te|ta)$")
    household: Optional[HouseholdProfile] = None


class DailyPlanResponse(BaseModel):
    summary: str
    risk_level: str
    sections: PlanSections
    today_timeline: List[PlanTimelineItem]
    impact_summary: ImpactSummary
    cautions: List[str] = Field(default_factory=list)
    disclaimer: str


# --- Chat Models ---


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(
        ..., min_length=1, max_length=1000, description="User conversational query capped at 1000 characters"
    )
    city: str = Field(default="Delhi", min_length=1, max_length=60, pattern=r"^[\w\s()\-.]+$")
    language: str = Field(default="en", pattern=r"^(en|hi|te|ta)$")
    household: Optional[HouseholdProfile] = None
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    grounded_sources: List[str] = Field(default_factory=list)
    suggested_questions: List[str] = Field(default_factory=list)
    safe_window_summary: Optional[str] = None
    disclaimer: str


# --- Community & School Models ---


class CommunityChallenge(BaseModel):
    id: str
    title: str
    description: str
    participants_count: int
    total_co2_saved_kg: float
    target_date: str
    completed: bool = False


class CommunityLeaderboardEntry(BaseModel):
    neighbourhood: str
    city: str
    participants: int
    co2_avoided_kg: float
    car_free_trips: int


class SchoolGuidanceResponse(BaseModel):
    aqi: int
    category: str
    city: str
    assembly_guideline: str
    sports_guideline: str
    recess_guideline: str
    classroom_guideline: str
    precautions_for_asthmatic_students: List[str]
