import { AirQualityData } from './api';

export interface CityDirectoryItem {
  name: string;
  state: string;
  aqi: number;
  cat: string;
  color: string;
}

export const METRO_CITIES = new Set([
  "delhi", "delhi (ncr)", "new delhi", "noida", "greater noida", "gurugram", "gurgaon",
  "ghaziabad", "faridabad", "mumbai", "navi mumbai", "bengaluru", "bangalore",
  "kolkata", "hyderabad", "chennai", "ahmedabad", "pune", "jaipur", "lucknow",
  "kochi", "kanpur", "nagpur"
]);

export const CITY_PRESETS: Record<string, AirQualityData> = {
  delhi: {
    location: { name: "Delhi (NCR)", state: "Delhi", country: "India", lat: 28.6139, lon: 77.2090 },
    station: { name: "Lodhi Road CAAQMS Station", distance_km: 2.1 },
    current: {
      aqi: 345, category: "Very Poor", cpcb_color: "#e74c3c",
      pm2_5: 178.4, pm10: 288.0, no2: 45.2, so2: 14.8, co: 1.9, o3: 28.5,
      dominant_pollutant: { name: "PM2.5", sub_index: 345 }
    },
    weather: { temp_c: 11.2, humidity: 74, wind_kmh: 4.5, wind_direction: "NW", conditions: "Winter Inversion Smog" },
    forecast: [
      { hour: "00:00", aqi: 402, pm2_5: 167.7 },
      { hour: "02:00", aqi: 418, pm2_5: 174.8 },
      { hour: "04:00", aqi: 452, pm2_5: 189.1 },
      { hour: "06:00", aqi: 491, pm2_5: 205.2 },
      { hour: "08:00", aqi: 500, pm2_5: 223.0 },
      { hour: "10:00", aqi: 448, pm2_5: 187.3 },
      { hour: "12:00", aqi: 376, pm2_5: 157.0 },
      { hour: "14:00", aqi: 316, pm2_5: 132.0 },
      { hour: "16:00", aqi: 351, pm2_5: 146.3 },
      { hour: "18:00", aqi: 444, pm2_5: 185.5 },
      { hour: "20:00", aqi: 496, pm2_5: 206.9 },
      { hour: "22:00", aqi: 436, pm2_5: 182.0 }
    ],
    safe_windows: [
      { start: "13:30", end: "16:30", avg_aqi: 330, category: "Very Poor", guidance: "Lowest forecast AQI today (~330) during peak afternoon thermal mixing; vulnerable individuals remain indoors." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  guntur: {
    location: { name: "Guntur", state: "Andhra Pradesh", country: "India", lat: 16.3067, lon: 80.4365 },
    station: { name: "Anandpet Ambient Air Monitoring Station", distance_km: 3.4 },
    current: {
      aqi: 118, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 41.5, pm10: 85.0, no2: 22.0, so2: 8.5, co: 0.8, o3: 34.0
    },
    weather: { temp_c: 26.5, humidity: 62, wind_kmh: 11.0, wind_direction: "SE", conditions: "Partly Sunny / Coastal Breeze" },
    forecast: [
      { hour: "00:00", aqi: 111, pm2_5: 39.0 },
      { hour: "02:00", aqi: 116, pm2_5: 40.7 },
      { hour: "04:00", aqi: 125, pm2_5: 44.0 },
      { hour: "06:00", aqi: 136, pm2_5: 47.7 },
      { hour: "08:00", aqi: 148, pm2_5: 51.9 },
      { hour: "10:00", aqi: 124, pm2_5: 43.6 },
      { hour: "12:00", aqi: 104, pm2_5: 36.5 },
      { hour: "14:00", aqi: 87, pm2_5: 30.7 },
      { hour: "16:00", aqi: 97, pm2_5: 34.0 },
      { hour: "18:00", aqi: 123, pm2_5: 43.2 },
      { hour: "20:00", aqi: 137, pm2_5: 48.1 },
      { hour: "22:00", aqi: 120, pm2_5: 42.3 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 88, category: "Satisfactory", guidance: "Lowest forecast AQI today (~88) during peak afternoon thermal mixing and coastal breeze." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  bengaluru: {
    location: { name: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946 },
    station: { name: "BTM Layout CAAQMS Station", distance_km: 2.8 },
    current: {
      aqi: 82, category: "Satisfactory", cpcb_color: "#27ae60",
      pm2_5: 27.2, pm10: 64.0, no2: 28.0, so2: 6.2, co: 0.6, o3: 22.0
    },
    weather: { temp_c: 21.0, humidity: 58, wind_kmh: 14.0, wind_direction: "E", conditions: "Fresh Highland Air" },
    forecast: [
      { hour: "00:00", aqi: 77, pm2_5: 25.6 },
      { hour: "02:00", aqi: 80, pm2_5: 26.7 },
      { hour: "04:00", aqi: 87, pm2_5: 28.8 },
      { hour: "06:00", aqi: 94, pm2_5: 31.3 },
      { hour: "08:00", aqi: 102, pm2_5: 34.0 },
      { hour: "10:00", aqi: 86, pm2_5: 28.6 },
      { hour: "12:00", aqi: 72, pm2_5: 23.9 },
      { hour: "14:00", aqi: 61, pm2_5: 20.1 },
      { hour: "16:00", aqi: 67, pm2_5: 22.3 },
      { hour: "18:00", aqi: 85, pm2_5: 28.3 },
      { hour: "20:00", aqi: 95, pm2_5: 31.6 },
      { hour: "22:00", aqi: 84, pm2_5: 27.7 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 58, category: "Satisfactory", guidance: "Lowest forecast AQI today (~58) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  mumbai: {
    location: { name: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0760, lon: 72.8777 },
    station: { name: "Bandra Kurla Complex (BKC) CAAQMS", distance_km: 1.9 },
    current: {
      aqi: 165, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 68.0, pm10: 142.0, no2: 38.5, so2: 11.0, co: 1.1, o3: 26.0
    },
    weather: { temp_c: 29.0, humidity: 78, wind_kmh: 16.0, wind_direction: "SW", conditions: "Coastal Sea Breeze / Humid" },
    forecast: [
      { hour: "00:00", aqi: 155, pm2_5: 63.9 },
      { hour: "02:00", aqi: 162, pm2_5: 66.6 },
      { hour: "04:00", aqi: 175, pm2_5: 72.1 },
      { hour: "06:00", aqi: 190, pm2_5: 78.2 },
      { hour: "08:00", aqi: 206, pm2_5: 85.0 },
      { hour: "10:00", aqi: 173, pm2_5: 71.4 },
      { hour: "12:00", aqi: 145, pm2_5: 59.8 },
      { hour: "14:00", aqi: 122, pm2_5: 50.3 },
      { hour: "16:00", aqi: 135, pm2_5: 55.8 },
      { hour: "18:00", aqi: 172, pm2_5: 70.7 },
      { hour: "20:00", aqi: 191, pm2_5: 78.9 },
      { hour: "22:00", aqi: 168, pm2_5: 69.4 }
    ],
    safe_windows: [
      { start: "13:30", end: "16:30", avg_aqi: 125, category: "Moderate", guidance: "Lowest forecast AQI today (~125) as midday sea breeze sweeps coastal basin." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  kolkata: {
    location: { name: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lon: 88.3639 },
    station: { name: "Victoria Memorial Ambient Station", distance_km: 2.5 },
    current: {
      aqi: 245, category: "Poor", cpcb_color: "#e67e22",
      pm2_5: 135.0, pm10: 220.0, no2: 41.0, so2: 12.5, co: 1.5, o3: 24.0
    },
    weather: { temp_c: 22.0, humidity: 68, wind_kmh: 5.0, wind_direction: "N", conditions: "Winter River Mist / Hazy" },
    forecast: [
      { hour: "00:00", aqi: 230, pm2_5: 126.9 },
      { hour: "02:00", aqi: 240, pm2_5: 132.3 },
      { hour: "04:00", aqi: 260, pm2_5: 143.1 },
      { hour: "06:00", aqi: 282, pm2_5: 155.2 },
      { hour: "08:00", aqi: 306, pm2_5: 168.8 },
      { hour: "10:00", aqi: 257, pm2_5: 141.8 },
      { hour: "12:00", aqi: 216, pm2_5: 118.8 },
      { hour: "14:00", aqi: 181, pm2_5: 99.9 },
      { hour: "16:00", aqi: 201, pm2_5: 110.7 },
      { hour: "18:00", aqi: 255, pm2_5: 140.4 },
      { hour: "20:00", aqi: 284, pm2_5: 156.6 },
      { hour: "22:00", aqi: 250, pm2_5: 137.7 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:00", avg_aqi: 188, category: "Moderate", guidance: "Lowest forecast AQI today (~188) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  hyderabad: {
    location: { name: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lon: 78.4867 },
    station: { name: "Sanathnagar CAAQMS Station", distance_km: 3.1 },
    current: {
      aqi: 138, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 52.0, pm10: 110.0, no2: 32.0, so2: 9.0, co: 0.9, o3: 30.0
    },
    weather: { temp_c: 25.0, humidity: 55, wind_kmh: 9.5, wind_direction: "NE", conditions: "Clear & Mild Breeze" },
    forecast: [
      { hour: "00:00", aqi: 130, pm2_5: 48.9 },
      { hour: "02:00", aqi: 135, pm2_5: 51.0 },
      { hour: "04:00", aqi: 146, pm2_5: 55.1 },
      { hour: "06:00", aqi: 159, pm2_5: 59.8 },
      { hour: "08:00", aqi: 172, pm2_5: 65.0 },
      { hour: "10:00", aqi: 145, pm2_5: 54.6 },
      { hour: "12:00", aqi: 121, pm2_5: 45.8 },
      { hour: "14:00", aqi: 102, pm2_5: 38.5 },
      { hour: "16:00", aqi: 113, pm2_5: 42.6 },
      { hour: "18:00", aqi: 144, pm2_5: 54.1 },
      { hour: "20:00", aqi: 160, pm2_5: 60.3 },
      { hour: "22:00", aqi: 141, pm2_5: 53.0 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 106, category: "Moderate", guidance: "Lowest forecast AQI today (~106) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  chennai: {
    location: { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707 },
    station: { name: "Alandur CAAQMS Continuous Station", distance_km: 2.2 },
    current: {
      aqi: 92, category: "Satisfactory", cpcb_color: "#27ae60",
      pm2_5: 31.0, pm10: 68.0, no2: 24.0, so2: 7.2, co: 0.7, o3: 28.0
    },
    weather: { temp_c: 28.5, humidity: 75, wind_kmh: 15.0, wind_direction: "E", conditions: "Bay of Bengal Sea Breeze" },
    forecast: [
      { hour: "00:00", aqi: 86, pm2_5: 29.1 },
      { hour: "02:00", aqi: 90, pm2_5: 30.4 },
      { hour: "04:00", aqi: 98, pm2_5: 32.9 },
      { hour: "06:00", aqi: 106, pm2_5: 35.6 },
      { hour: "08:00", aqi: 115, pm2_5: 38.8 },
      { hour: "10:00", aqi: 97, pm2_5: 32.6 },
      { hour: "12:00", aqi: 81, pm2_5: 27.3 },
      { hour: "14:00", aqi: 68, pm2_5: 22.9 },
      { hour: "16:00", aqi: 75, pm2_5: 25.4 },
      { hour: "18:00", aqi: 96, pm2_5: 32.2 },
      { hour: "20:00", aqi: 107, pm2_5: 36.0 },
      { hour: "22:00", aqi: 94, pm2_5: 31.6 }
    ],
    safe_windows: [
      { start: "13:30", end: "16:30", avg_aqi: 68, category: "Satisfactory", guidance: "Lowest forecast AQI today (~68) during peak afternoon sea breeze dispersion." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  pune: {
    location: { name: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lon: 73.8567 },
    station: { name: "Shivajinagar Ambient CAAQMS", distance_km: 2.7 },
    current: {
      aqi: 135, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 49.0, pm10: 102.0, no2: 30.0, so2: 8.8, co: 0.8, o3: 27.0
    },
    weather: { temp_c: 24.0, humidity: 52, wind_kmh: 10.0, wind_direction: "W", conditions: "Dry Western Ghats Air" },
    forecast: [
      { hour: "00:00", aqi: 127, pm2_5: 46.1 },
      { hour: "02:00", aqi: 132, pm2_5: 48.0 },
      { hour: "04:00", aqi: 143, pm2_5: 51.9 },
      { hour: "06:00", aqi: 155, pm2_5: 56.3 },
      { hour: "08:00", aqi: 169, pm2_5: 61.2 },
      { hour: "10:00", aqi: 142, pm2_5: 51.5 },
      { hour: "12:00", aqi: 119, pm2_5: 43.1 },
      { hour: "14:00", aqi: 100, pm2_5: 36.3 },
      { hour: "16:00", aqi: 111, pm2_5: 40.2 },
      { hour: "18:00", aqi: 140, pm2_5: 51.0 },
      { hour: "20:00", aqi: 157, pm2_5: 56.8 },
      { hour: "22:00", aqi: 138, pm2_5: 50.0 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 98, category: "Satisfactory", guidance: "Lowest forecast AQI today (~98) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  ahmedabad: {
    location: { name: "Ahmedabad", state: "Gujarat", country: "India", lat: 23.0225, lon: 72.5714 },
    station: { name: "Maninagar CAAQMS Station", distance_km: 3.0 },
    current: {
      aqi: 175, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 72.0, pm10: 148.0, no2: 36.0, so2: 12.0, co: 1.1, o3: 25.0
    },
    weather: { temp_c: 27.0, humidity: 45, wind_kmh: 8.0, wind_direction: "NE", conditions: "Dry & Hazy" },
    forecast: [
      { hour: "00:00", aqi: 164, pm2_5: 67.7 },
      { hour: "02:00", aqi: 172, pm2_5: 70.6 },
      { hour: "04:00", aqi: 186, pm2_5: 76.3 },
      { hour: "06:00", aqi: 201, pm2_5: 82.8 },
      { hour: "08:00", aqi: 219, pm2_5: 90.0 },
      { hour: "10:00", aqi: 184, pm2_5: 75.6 },
      { hour: "12:00", aqi: 154, pm2_5: 63.4 },
      { hour: "14:00", aqi: 130, pm2_5: 53.3 },
      { hour: "16:00", aqi: 144, pm2_5: 59.0 },
      { hour: "18:00", aqi: 182, pm2_5: 74.9 },
      { hour: "20:00", aqi: 203, pm2_5: 83.5 },
      { hour: "22:00", aqi: 178, pm2_5: 73.4 }
    ],
    safe_windows: [
      { start: "13:30", end: "16:30", avg_aqi: 132, category: "Moderate", guidance: "Lowest forecast AQI today (~132) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  jaipur: {
    location: { name: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lon: 75.7873 },
    station: { name: "Adarsh Nagar CAAQMS", distance_km: 2.3 },
    current: {
      aqi: 215, category: "Poor", cpcb_color: "#e67e22",
      pm2_5: 112.0, pm10: 195.0, no2: 38.0, so2: 10.5, co: 1.3, o3: 23.0
    },
    weather: { temp_c: 19.0, humidity: 48, wind_kmh: 6.5, wind_direction: "NW", conditions: "Semi-Arid Winter Dust" },
    forecast: [
      { hour: "00:00", aqi: 202, pm2_5: 105.3 },
      { hour: "02:00", aqi: 211, pm2_5: 109.8 },
      { hour: "04:00", aqi: 228, pm2_5: 118.7 },
      { hour: "06:00", aqi: 247, pm2_5: 128.8 },
      { hour: "08:00", aqi: 269, pm2_5: 140.0 },
      { hour: "10:00", aqi: 226, pm2_5: 117.6 },
      { hour: "12:00", aqi: 189, pm2_5: 98.6 },
      { hour: "14:00", aqi: 159, pm2_5: 82.9 },
      { hour: "16:00", aqi: 176, pm2_5: 91.8 },
      { hour: "18:00", aqi: 224, pm2_5: 116.5 },
      { hour: "20:00", aqi: 249, pm2_5: 129.9 },
      { hour: "22:00", aqi: 219, pm2_5: 114.2 }
    ],
    safe_windows: [
      { start: "13:30", end: "16:30", avg_aqi: 158, category: "Moderate", guidance: "Lowest forecast AQI today (~158) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  lucknow: {
    location: { name: "Lucknow", state: "Uttar Pradesh", country: "India", lat: 26.8467, lon: 80.9462 },
    station: { name: "Gomti Nagar CAAQMS Station", distance_km: 2.9 },
    current: {
      aqi: 265, category: "Poor", cpcb_color: "#e67e22",
      pm2_5: 155.0, pm10: 250.0, no2: 44.0, so2: 13.5, co: 1.7, o3: 26.0
    },
    weather: { temp_c: 14.5, humidity: 72, wind_kmh: 4.0, wind_direction: "W", conditions: "Indo-Gangetic Smog" },
    forecast: [
      { hour: "00:00", aqi: 249, pm2_5: 145.7 },
      { hour: "02:00", aqi: 260, pm2_5: 151.9 },
      { hour: "04:00", aqi: 281, pm2_5: 164.3 },
      { hour: "06:00", aqi: 305, pm2_5: 178.2 },
      { hour: "08:00", aqi: 331, pm2_5: 193.8 },
      { hour: "10:00", aqi: 278, pm2_5: 162.8 },
      { hour: "12:00", aqi: 233, pm2_5: 136.4 },
      { hour: "14:00", aqi: 196, pm2_5: 114.7 },
      { hour: "16:00", aqi: 217, pm2_5: 127.1 },
      { hour: "18:00", aqi: 276, pm2_5: 161.2 },
      { hour: "20:00", aqi: 307, pm2_5: 179.8 },
      { hour: "22:00", aqi: 270, pm2_5: 158.1 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:00", avg_aqi: 198, category: "Moderate", guidance: "Lowest forecast AQI today (~198) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  patna: {
    location: { name: "Patna", state: "Bihar", country: "India", lat: 25.5941, lon: 85.1376 },
    station: { name: "Muradpur Ambient CAAQMS", distance_km: 3.2 },
    current: {
      aqi: 290, category: "Very Poor", cpcb_color: "#e74c3c",
      pm2_5: 182.0, pm10: 295.0, no2: 46.0, so2: 16.0, co: 2.0, o3: 24.0
    },
    weather: { temp_c: 15.0, humidity: 76, wind_kmh: 3.5, wind_direction: "NW", conditions: "Ganga Valley Winter Stagnation" },
    forecast: [
      { hour: "00:00", aqi: 273, pm2_5: 171.1 },
      { hour: "02:00", aqi: 284, pm2_5: 178.4 },
      { hour: "04:00", aqi: 307, pm2_5: 192.9 },
      { hour: "06:00", aqi: 334, pm2_5: 209.3 },
      { hour: "08:00", aqi: 362, pm2_5: 227.5 },
      { hour: "10:00", aqi: 304, pm2_5: 191.1 },
      { hour: "12:00", aqi: 255, pm2_5: 160.2 },
      { hour: "14:00", aqi: 215, pm2_5: 134.7 },
      { hour: "16:00", aqi: 238, pm2_5: 149.2 },
      { hour: "18:00", aqi: 302, pm2_5: 189.3 },
      { hour: "20:00", aqi: 336, pm2_5: 211.1 },
      { hour: "22:00", aqi: 296, pm2_5: 185.6 }
    ],
    safe_windows: [
      { start: "13:30", end: "16:00", avg_aqi: 215, category: "Poor", guidance: "Lowest forecast AQI today (~215) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  vijayawada: {
    location: { name: "Vijayawada", state: "Andhra Pradesh", country: "India", lat: 16.5062, lon: 80.6480 },
    station: { name: "Benz Circle CAAQMS Station", distance_km: 2.6 },
    current: {
      aqi: 108, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 37.0, pm10: 78.0, no2: 21.0, so2: 7.5, co: 0.7, o3: 32.0
    },
    weather: { temp_c: 27.0, humidity: 64, wind_kmh: 12.0, wind_direction: "SE", conditions: "Krishna River Breeze" },
    forecast: [
      { hour: "00:00", aqi: 102, pm2_5: 34.8 },
      { hour: "02:00", aqi: 106, pm2_5: 36.3 },
      { hour: "04:00", aqi: 114, pm2_5: 39.2 },
      { hour: "06:00", aqi: 124, pm2_5: 42.5 },
      { hour: "08:00", aqi: 135, pm2_5: 46.2 },
      { hour: "10:00", aqi: 113, pm2_5: 38.9 },
      { hour: "12:00", aqi: 95, pm2_5: 32.6 },
      { hour: "14:00", aqi: 80, pm2_5: 27.4 },
      { hour: "16:00", aqi: 89, pm2_5: 30.3 },
      { hour: "18:00", aqi: 112, pm2_5: 38.5 },
      { hour: "20:00", aqi: 125, pm2_5: 42.9 },
      { hour: "22:00", aqi: 110, pm2_5: 37.7 }
    ],
    safe_windows: [
      { start: "13:00", end: "17:00", avg_aqi: 100, category: "Satisfactory", guidance: "Optimal afternoon airflow across river valley; safe for normal routines." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  visakhapatnam: {
    location: { name: "Visakhapatnam", state: "Andhra Pradesh", country: "India", lat: 17.6868, lon: 83.2185 },
    station: { name: "Gajuwaka Industrial CAAQMS", distance_km: 3.5 },
    current: {
      aqi: 88, category: "Satisfactory", cpcb_color: "#27ae60",
      pm2_5: 29.5, pm10: 66.0, no2: 26.0, so2: 8.0, co: 0.6, o3: 29.0
    },
    weather: { temp_c: 26.0, humidity: 70, wind_kmh: 14.5, wind_direction: "E", conditions: "Bay Breeze / Clean" },
    forecast: [
      { hour: "00:00", aqi: 83, pm2_5: 27.7 },
      { hour: "02:00", aqi: 86, pm2_5: 28.9 },
      { hour: "04:00", aqi: 93, pm2_5: 31.3 },
      { hour: "06:00", aqi: 101, pm2_5: 33.9 },
      { hour: "08:00", aqi: 110, pm2_5: 36.9 },
      { hour: "10:00", aqi: 92, pm2_5: 31.0 },
      { hour: "12:00", aqi: 77, pm2_5: 26.0 },
      { hour: "14:00", aqi: 65, pm2_5: 21.8 },
      { hour: "16:00", aqi: 72, pm2_5: 24.2 },
      { hour: "18:00", aqi: 92, pm2_5: 30.7 },
      { hour: "20:00", aqi: 102, pm2_5: 34.2 },
      { hour: "22:00", aqi: 90, pm2_5: 30.1 }
    ],
    safe_windows: [
      { start: "06:00", end: "10:30", avg_aqi: 82, category: "Satisfactory", guidance: "Beachfront morning air is fresh and ideal for cardio." },
      { start: "14:00", end: "18:00", avg_aqi: 84, category: "Satisfactory", guidance: "Consistent sea breeze prevents pollutant buildup." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  chandigarh: {
    location: { name: "Chandigarh", state: "Chandigarh", country: "India", lat: 30.7333, lon: 76.7794 },
    station: { name: "Sector 22 CAAQMS Station", distance_km: 2.0 },
    current: {
      aqi: 128, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 46.0, pm10: 95.0, no2: 25.0, so2: 7.0, co: 0.8, o3: 26.0
    },
    weather: { temp_c: 13.0, humidity: 62, wind_kmh: 7.0, wind_direction: "NW", conditions: "Foothill Breeze / Mild Haze" },
    forecast: [
      { hour: "00:00", aqi: 120, pm2_5: 43.2 },
      { hour: "02:00", aqi: 125, pm2_5: 45.1 },
      { hour: "04:00", aqi: 136, pm2_5: 48.8 },
      { hour: "06:00", aqi: 147, pm2_5: 52.9 },
      { hour: "08:00", aqi: 160, pm2_5: 57.5 },
      { hour: "10:00", aqi: 134, pm2_5: 48.3 },
      { hour: "12:00", aqi: 113, pm2_5: 40.5 },
      { hour: "14:00", aqi: 95, pm2_5: 34.0 },
      { hour: "16:00", aqi: 105, pm2_5: 37.7 },
      { hour: "18:00", aqi: 133, pm2_5: 47.8 },
      { hour: "20:00", aqi: 148, pm2_5: 53.4 },
      { hour: "22:00", aqi: 131, pm2_5: 46.9 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 92, category: "Satisfactory", guidance: "Lowest forecast AQI today (~92) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  indore: {
    location: { name: "Indore", state: "Madhya Pradesh", country: "India", lat: 22.7196, lon: 75.8577 },
    station: { name: "Chhoti Gwaltoli CAAQMS", distance_km: 2.1 },
    current: {
      aqi: 115, category: "Moderate", cpcb_color: "#f39c12",
      pm2_5: 40.0, pm10: 82.0, no2: 24.0, so2: 8.0, co: 0.7, o3: 28.0
    },
    weather: { temp_c: 21.0, humidity: 48, wind_kmh: 9.0, wind_direction: "NE", conditions: "Clear Plateau Sky" },
    forecast: [
      { hour: "00:00", aqi: 108, pm2_5: 37.6 },
      { hour: "02:00", aqi: 113, pm2_5: 39.2 },
      { hour: "04:00", aqi: 122, pm2_5: 42.4 },
      { hour: "06:00", aqi: 132, pm2_5: 46.0 },
      { hour: "08:00", aqi: 144, pm2_5: 50.0 },
      { hour: "10:00", aqi: 121, pm2_5: 42.0 },
      { hour: "12:00", aqi: 101, pm2_5: 35.2 },
      { hour: "14:00", aqi: 85, pm2_5: 29.6 },
      { hour: "16:00", aqi: 94, pm2_5: 32.8 },
      { hour: "18:00", aqi: 120, pm2_5: 41.6 },
      { hour: "20:00", aqi: 133, pm2_5: 46.4 },
      { hour: "22:00", aqi: 117, pm2_5: 40.8 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 84, category: "Satisfactory", guidance: "Lowest forecast AQI today (~84) during peak afternoon thermal mixing." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  },

  kochi: {
    location: { name: "Kochi", state: "Kerala", country: "India", lat: 9.9312, lon: 76.2673 },
    station: { name: "Vytilla CAAQMS Ambient Monitor", distance_km: 1.8 },
    current: {
      aqi: 58, category: "Satisfactory", cpcb_color: "#27ae60",
      pm2_5: 18.0, pm10: 42.0, no2: 18.0, so2: 5.0, co: 0.5, o3: 24.0
    },
    weather: { temp_c: 29.0, humidity: 82, wind_kmh: 17.0, wind_direction: "W", conditions: "Coastal Arabian Sea Air" },
    forecast: [
      { hour: "00:00", aqi: 55, pm2_5: 16.9 },
      { hour: "02:00", aqi: 57, pm2_5: 17.6 },
      { hour: "04:00", aqi: 61, pm2_5: 19.1 },
      { hour: "06:00", aqi: 67, pm2_5: 20.7 },
      { hour: "08:00", aqi: 72, pm2_5: 22.5 },
      { hour: "10:00", aqi: 61, pm2_5: 18.9 },
      { hour: "12:00", aqi: 51, pm2_5: 15.8 },
      { hour: "14:00", aqi: 43, pm2_5: 13.3 },
      { hour: "16:00", aqi: 48, pm2_5: 14.8 },
      { hour: "18:00", aqi: 60, pm2_5: 18.7 },
      { hour: "20:00", aqi: 67, pm2_5: 20.9 },
      { hour: "22:00", aqi: 59, pm2_5: 18.4 }
    ],
    safe_windows: [
      { start: "13:00", end: "16:30", avg_aqi: 42, category: "Good", guidance: "Lowest forecast AQI today (~42) during peak sea breeze." }
    ],
    source: "open-meteo / CPCB", fetched_at: new Date().toISOString(), is_stale: false
  }
};



// Search directory for instant autocomplete
export const ALL_SEARCHABLE_CITIES: CityDirectoryItem[] = [
  { name: "Delhi", state: "Delhi NCR", aqi: 345, cat: "Very Poor", color: "#e74c3c" },
  { name: "Guntur", state: "Andhra Pradesh", aqi: 118, cat: "Moderate", color: "#f39c12" },
  { name: "Bengaluru", state: "Karnataka", aqi: 82, cat: "Satisfactory", color: "#27ae60" },
  { name: "Mumbai", state: "Maharashtra", aqi: 165, cat: "Moderate", color: "#f39c12" },
  { name: "Kolkata", state: "West Bengal", aqi: 245, cat: "Poor", color: "#e67e22" },
  { name: "Hyderabad", state: "Telangana", aqi: 138, cat: "Moderate", color: "#f39c12" },
  { name: "Chennai", state: "Tamil Nadu", aqi: 92, cat: "Satisfactory", color: "#27ae60" },
  { name: "Pune", state: "Maharashtra", aqi: 135, cat: "Moderate", color: "#f39c12" },
  { name: "Ahmedabad", state: "Gujarat", aqi: 175, cat: "Moderate", color: "#f39c12" },
  { name: "Jaipur", state: "Rajasthan", aqi: 215, cat: "Poor", color: "#e67e22" },
  { name: "Lucknow", state: "Uttar Pradesh", aqi: 265, cat: "Poor", color: "#e67e22" },
  { name: "Patna", state: "Bihar", aqi: 290, cat: "Very Poor", color: "#e74c3c" },
  { name: "Vijayawada", state: "Andhra Pradesh", aqi: 108, cat: "Moderate", color: "#f39c12" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", aqi: 88, cat: "Satisfactory", color: "#27ae60" },
  { name: "Chandigarh", state: "Punjab / Haryana", aqi: 128, cat: "Moderate", color: "#f39c12" },
  { name: "Indore", state: "Madhya Pradesh", aqi: 115, cat: "Moderate", color: "#f39c12" },
  { name: "Kochi", state: "Kerala", aqi: 58, cat: "Satisfactory", color: "#27ae60" },
  { name: "Noida", state: "Uttar Pradesh", aqi: 310, cat: "Very Poor", color: "#e74c3c" },
  { name: "Gurugram", state: "Haryana", aqi: 295, cat: "Very Poor", color: "#e74c3c" },
  { name: "Varanasi", state: "Uttar Pradesh", aqi: 255, cat: "Poor", color: "#e67e22" },
  { name: "Coimbatore", state: "Tamil Nadu", aqi: 68, cat: "Satisfactory", color: "#27ae60" },
  { name: "Surat", state: "Gujarat", aqi: 130, cat: "Moderate", color: "#f39c12" },
  { name: "Nagpur", state: "Maharashtra", aqi: 118, cat: "Moderate", color: "#f39c12" }
];



export const DEFAULT_AQI_DATA: AirQualityData = CITY_PRESETS.delhi;
