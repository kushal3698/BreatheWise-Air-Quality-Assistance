from typing import Dict, Any, Optional
import httpx

KNOWN_LOCATIONS: Dict[str, Dict[str, Any]] = {
    "delhi": {"name": "Delhi", "state": "Delhi", "country": "India", "lat": 28.6139, "lon": 77.2090},
    "new delhi": {"name": "New Delhi", "state": "Delhi", "country": "India", "lat": 28.6139, "lon": 77.2090},
    "guntur": {"name": "Guntur", "state": "Andhra Pradesh", "country": "India", "lat": 16.3067, "lon": 80.4365},
    "bengaluru": {"name": "Bengaluru", "state": "Karnataka", "country": "India", "lat": 12.9716, "lon": 77.5946},
    "bangalore": {"name": "Bengaluru", "state": "Karnataka", "country": "India", "lat": 12.9716, "lon": 77.5946},
    "mumbai": {"name": "Mumbai", "state": "Maharashtra", "country": "India", "lat": 19.0760, "lon": 72.8777},
    "kolkata": {"name": "Kolkata", "state": "West Bengal", "country": "India", "lat": 22.5726, "lon": 88.3639},
    "chennai": {"name": "Chennai", "state": "Tamil Nadu", "country": "India", "lat": 13.0827, "lon": 80.2707},
    "hyderabad": {"name": "Hyderabad", "state": "Telangana", "country": "India", "lat": 17.3850, "lon": 78.4867},
    "pune": {"name": "Pune", "state": "Maharashtra", "country": "India", "lat": 18.5204, "lon": 73.8567},
    "ahmedabad": {"name": "Ahmedabad", "state": "Gujarat", "country": "India", "lat": 23.0225, "lon": 72.5714},
    "lucknow": {"name": "Lucknow", "state": "Uttar Pradesh", "country": "India", "lat": 26.8467, "lon": 80.9462},
    "patna": {"name": "Patna", "state": "Bihar", "country": "India", "lat": 25.5941, "lon": 85.1376},
    "vijayawada": {"name": "Vijayawada", "state": "Andhra Pradesh", "country": "India", "lat": 16.5062, "lon": 80.6480},
    "visakhapatnam": {"name": "Visakhapatnam", "state": "Andhra Pradesh", "country": "India", "lat": 17.6868, "lon": 83.2185},
    "vizag": {"name": "Visakhapatnam", "state": "Andhra Pradesh", "country": "India", "lat": 17.6868, "lon": 83.2185},
    "jaipur": {"name": "Jaipur", "state": "Rajasthan", "country": "India", "lat": 26.9124, "lon": 75.7873},
    "noida": {"name": "Noida", "state": "Uttar Pradesh", "country": "India", "lat": 28.5355, "lon": 77.3910},
    "greater noida": {"name": "Greater Noida", "state": "Uttar Pradesh", "country": "India", "lat": 28.4744, "lon": 77.5040},
    "gurugram": {"name": "Gurugram", "state": "Haryana", "country": "India", "lat": 28.4595, "lon": 77.0266},
    "gurgaon": {"name": "Gurugram", "state": "Haryana", "country": "India", "lat": 28.4595, "lon": 77.0266},
    "chandigarh": {"name": "Chandigarh", "state": "Chandigarh", "country": "India", "lat": 30.7333, "lon": 76.7794},
    "indore": {"name": "Indore", "state": "Madhya Pradesh", "country": "India", "lat": 22.7196, "lon": 75.8577},
    "bhopal": {"name": "Bhopal", "state": "Madhya Pradesh", "country": "India", "lat": 23.2599, "lon": 77.4126},
    "surat": {"name": "Surat", "state": "Gujarat", "country": "India", "lat": 21.1702, "lon": 72.8311},
    "nagpur": {"name": "Nagpur", "state": "Maharashtra", "country": "India", "lat": 21.1458, "lon": 79.0882},
    "kochi": {"name": "Kochi", "state": "Kerala", "country": "India", "lat": 9.9312, "lon": 76.2673},
    "coimbatore": {"name": "Coimbatore", "state": "Tamil Nadu", "country": "India", "lat": 11.0168, "lon": 76.9558},
    "varanasi": {"name": "Varanasi", "state": "Uttar Pradesh", "country": "India", "lat": 25.3176, "lon": 82.9739},
    "agra": {"name": "Agra", "state": "Uttar Pradesh", "country": "India", "lat": 27.1767, "lon": 78.0081},
    "kanpur": {"name": "Kanpur", "state": "Uttar Pradesh", "country": "India", "lat": 26.4499, "lon": 80.3319},
    "guwahati": {"name": "Guwahati", "state": "Assam", "country": "India", "lat": 26.1445, "lon": 91.7362},
    "amritsar": {"name": "Amritsar", "state": "Punjab", "country": "India", "lat": 31.6340, "lon": 74.8723},
    "ludhiana": {"name": "Ludhiana", "state": "Punjab", "country": "India", "lat": 30.9010, "lon": 75.8573},
    "dehradun": {"name": "Dehradun", "state": "Uttarakhand", "country": "India", "lat": 30.3165, "lon": 78.0322},
    "ranchi": {"name": "Ranchi", "state": "Jharkhand", "country": "India", "lat": 23.3441, "lon": 85.3096},
    "thiruvananthapuram": {"name": "Thiruvananthapuram", "state": "Kerala", "country": "India", "lat": 8.5241, "lon": 76.9366},
    "trivandrum": {"name": "Thiruvananthapuram", "state": "Kerala", "country": "India", "lat": 8.5241, "lon": 76.9366},
    "mysuru": {"name": "Mysuru", "state": "Karnataka", "country": "India", "lat": 12.2958, "lon": 76.6394},
    "mangalore": {"name": "Mangaluru", "state": "Karnataka", "country": "India", "lat": 12.9141, "lon": 74.8560},
    "tirupati": {"name": "Tirupati", "state": "Andhra Pradesh", "country": "India", "lat": 13.6288, "lon": 79.4192},
}

async def geocode_city(city_query: str) -> Dict[str, Any]:
    normalized = city_query.strip().lower()
    if normalized in KNOWN_LOCATIONS:
        return KNOWN_LOCATIONS[normalized]
        
    for k, v in KNOWN_LOCATIONS.items():
        if k in normalized or normalized in k:
            return v

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={"name": city_query, "count": 1, "language": "en", "format": "json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results")
                if results and len(results) > 0:
                    first = results[0]
                    return {
                        "name": first.get("name", city_query),
                        "state": first.get("admin1", ""),
                        "country": first.get("country", "India"),
                        "lat": float(first.get("latitude")),
                        "lon": float(first.get("longitude")),
                    }
    except Exception:
        pass

    # Default fallback to Delhi with customized name
    fallback = dict(KNOWN_LOCATIONS["delhi"])
    fallback["name"] = city_query.title()
    return fallback
