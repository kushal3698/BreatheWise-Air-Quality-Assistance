import type { AirQualityData } from './api';
import citiesData from '../data/cities.json';

export interface CityDirectoryItem {
  name: string;
  state: string;
  aqi: number;
  cat: string;
  color: string;
}

interface CitiesPayload {
  metroCities: string[];
  cityPresets: Record<string, AirQualityData>;
  searchableCities: CityDirectoryItem[];
}

const parsedCities = citiesData as CitiesPayload;

export const METRO_CITIES: Set<string> = new Set(parsedCities.metroCities);

export const CITY_PRESETS: Record<string, AirQualityData> = parsedCities.cityPresets;

export const ALL_SEARCHABLE_CITIES: CityDirectoryItem[] = parsedCities.searchableCities;

export const DEFAULT_AQI_DATA: AirQualityData = parsedCities.cityPresets.delhi ?? Object.values(parsedCities.cityPresets)[0]!;
