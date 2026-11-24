from typing import List

from fastapi import APIRouter

from app.models.schemas import CommunityChallenge, CommunityLeaderboardEntry

router = APIRouter(prefix="/api/community", tags=["Community"])

DEMO_CHALLENGES: List[CommunityChallenge] = [
    CommunityChallenge(
        id="c1",
        title="Car-Free Friday Challenge",
        description="Pledge to replace private car trips with public transit (bus/metro), cycling, or shared electric shuttles this Friday.",
        participants_count=342,
        total_co2_saved_kg=1280.5,
        target_date="This Friday",
        completed=False,
    ),
    CommunityChallenge(
        id="c2",
        title="Neighbourhood Filter Box Drive",
        description="Assemble 50 DIY Corsi-Rosenthal boxes for local government school classrooms and community libraries.",
        participants_count=86,
        total_co2_saved_kg=410.0,
        target_date="Next Sunday",
        completed=True,
    ),
    CommunityChallenge(
        id="c3",
        title="Zero Open-Burning Vigilance",
        description="Community reporting of dry-leaf and waste burning with neighborhood composting collection.",
        participants_count=512,
        total_co2_saved_kg=3420.0,
        target_date="Ongoing Winter Smog Season",
        completed=False,
    ),
]

DEMO_LEADERBOARD: List[CommunityLeaderboardEntry] = [
    CommunityLeaderboardEntry(
        neighbourhood="Vasant Kunj RWA", city="Delhi", participants=145, co2_avoided_kg=1850.0, car_free_trips=480
    ),
    CommunityLeaderboardEntry(
        neighbourhood="Pattabhipuram Green Colony",
        city="Guntur",
        participants=98,
        co2_avoided_kg=1120.0,
        car_free_trips=310,
    ),
    CommunityLeaderboardEntry(
        neighbourhood="Indiranagar Eco Coalition",
        city="Bengaluru",
        participants=210,
        co2_avoided_kg=2430.0,
        car_free_trips=720,
    ),
    CommunityLeaderboardEntry(
        neighbourhood="Bandra West Citizens", city="Mumbai", participants=134, co2_avoided_kg=1450.0, car_free_trips=390
    ),
]


@router.get("/challenges", response_model=List[CommunityChallenge])
async def get_community_challenges():
    return DEMO_CHALLENGES


@router.get("/leaderboard", response_model=List[CommunityLeaderboardEntry])
async def get_community_leaderboard():
    return DEMO_LEADERBOARD
