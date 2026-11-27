import { CommunityChallenge, CommunityLeaderboardEntry } from './api';

export const DEFAULT_COMMUNITY_CHALLENGES: CommunityChallenge[] = [
  {
    id: "c1",
    title: "Car-Free Friday Challenge",
    description: "Pledge to replace private car trips with public transit (bus/metro), cycling, or shared electric shuttles this Friday.",
    participants_count: 342,
    total_co2_saved_kg: 1280.5,
    target_date: "This Friday",
    completed: false
  },
  {
    id: "c2",
    title: "Neighbourhood Filter Box Drive",
    description: "Assemble 50 DIY Corsi-Rosenthal boxes for local government school classrooms and community libraries.",
    participants_count: 86,
    total_co2_saved_kg: 410.0,
    target_date: "Next Sunday",
    completed: true
  },
  {
    id: "c3",
    title: "Zero Open-Burning Vigilance",
    description: "Community reporting of dry-leaf and municipal waste burning with neighborhood composting collection.",
    participants_count: 512,
    total_co2_saved_kg: 3420.0,
    target_date: "Ongoing Smog Season",
    completed: false
  }
];

export const DEFAULT_COMMUNITY_LEADERBOARD: CommunityLeaderboardEntry[] = [
  { neighbourhood: "Indiranagar Eco Coalition", city: "Bengaluru", participants: 210, co2_avoided_kg: 2430.0, car_free_trips: 720 },
  { neighbourhood: "Vasant Kunj RWA", city: "Delhi", participants: 145, co2_avoided_kg: 1850.0, car_free_trips: 480 },
  { neighbourhood: "Pattabhipuram Green Colony", city: "Guntur", participants: 98, co2_avoided_kg: 1120.0, car_free_trips: 310 },
  { neighbourhood: "Bandra West Citizens", city: "Mumbai", participants: 134, co2_avoided_kg: 1450.0, car_free_trips: 390 },
  { neighbourhood: "Ballygunge Civic Forum", city: "Kolkata", participants: 112, co2_avoided_kg: 1290.0, car_free_trips: 340 },
  { neighbourhood: "Jubilee Hills Green Initiative", city: "Hyderabad", participants: 165, co2_avoided_kg: 1780.0, car_free_trips: 460 }
];
