import { useState, useEffect, useRef } from 'react';
import { AirQualityData, fetchAQI } from '@/lib/api';
import { DEFAULT_AQI_DATA, getCityPresetAQI } from '@/lib/initialData';

export interface CityToastInfo {
  name: string;
  aqi: number;
  cat: string;
  color: string;
  safeWindow: string;
}

export function useAirQuality(initialCity = 'Delhi') {
  const [city, setCity] = useState(initialCity);
  const [cityInput, setCityInput] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [aqiData, setAqiData] = useState<AirQualityData>(DEFAULT_AQI_DATA);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [cityToast, setCityToast] = useState<CityToastInfo | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAQI(city)
      .then(data => {
        setAqiData(data);
        setIsLiveConnected(true);
      })
      .catch(() => {
        setIsLiveConnected(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCity = (cityName: string) => {
    setCity(cityName);
    const preset = getCityPresetAQI(cityName);
    setAqiData(preset);

    const firstSafe = preset.safe_windows && preset.safe_windows[0];
    const safeWindowStr = firstSafe ? `${firstSafe.start} – ${firstSafe.end}` : '13:00 – 16:00';

    setCityToast({
      name: preset.location.name,
      aqi: preset.current.aqi,
      cat: preset.current.category,
      color: preset.current.cpcb_color,
      safeWindow: safeWindowStr
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setCityToast(null);
    }, 3200);

    fetchAQI(cityName)
      .then(liveAQI => {
        setAqiData(liveAQI);
        setIsLiveConnected(true);
      })
      .catch(() => {
        setIsLiveConnected(false);
      });
  };

  return {
    city,
    setCity,
    cityInput,
    setCityInput,
    searchDropdownOpen,
    setSearchDropdownOpen,
    aqiData,
    setAqiData,
    isLiveConnected,
    setIsLiveConnected,
    cityToast,
    selectCity
  };
}
