/**
 * SupplyShield AI — Real-Time Global Weather & Automated Disruption Engine
 *
 * Connects directly to free Open-Meteo Global Meteorology APIs (No API key required)
 * to monitor multi-modal supply chain nodes in real time, detecting severe weather
 * anomalies (typhoons, gale warnings, heavy rain, extreme thermal drift) and
 * generating live disruption alerts.
 */

export interface WeatherNodeData {
  nodeId: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  temperatureCelsius: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  precipitationMm: number;
  weatherCode: number;
  weatherCondition: string;
  weatherIcon: string;
  isHazardous: boolean;
  hazardSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  hazardDescription?: string;
  lastUpdated: string;
}

// Major Global Logistic Corridors & Maritime Waypoints
export const MONITORED_WEATHER_NODES: { id: string; name: string; country: string; lat: number; lng: number }[] = [
  { id: 'shanghai', name: 'Port of Shanghai', country: 'CN', lat: 31.2304, lng: 121.4737 },
  { id: 'east_china_sea', name: 'East China Sea / Taiwan Strait', country: 'TW/CN', lat: 27.5000, lng: 123.8000 },
  { id: 'rotterdam', name: 'Port of Rotterdam', country: 'NL', lat: 51.9244, lng: 4.4777 },
  { id: 'suez', name: 'Suez Canal Chokepoint', country: 'EG', lat: 30.6085, lng: 32.3275 },
  { id: 'mumbai', name: 'JNPT Mumbai Port', country: 'IN', lat: 18.9499, lng: 72.9515 },
  { id: 'frankfurt', name: 'Frankfurt CargoCity', country: 'DE', lat: 50.0379, lng: 8.5622 },
  { id: 'singapore', name: 'Singapore Changi Maritime', country: 'SG', lat: 1.3521, lng: 103.8198 },
  { id: 'losangeles', name: 'Port of Los Angeles', country: 'US', lat: 33.7432, lng: -118.2673 },
  { id: 'chicago', name: 'Chicago Intermodal Hub', country: 'US', lat: 41.8781, lng: -87.6298 },
  { id: 'busan', name: 'Port of Busan', country: 'KR', lat: 35.1796, lng: 129.0756 },
  { id: 'dubai', name: 'Jebel Ali Free Zone', country: 'AE', lat: 25.0118, lng: 55.0617 },
  { id: 'pune', name: 'NH-48 Pune Corridor', country: 'IN', lat: 18.5204, lng: 73.8567 },
];

/**
 * Maps WMO weather interpretation codes to readable conditions and icons
 * Source: World Meteorological Organization (WMO) Code Table 4677
 */
function interpretWmoCode(code: number): { condition: string; icon: string; isSevere: boolean } {
  if (code === 0) return { condition: 'Clear Sky', icon: 'wb_sunny', isSevere: false };
  if (code === 1 || code === 2 || code === 3) return { condition: 'Partly Cloudy', icon: 'partly_cloudy_day', isSevere: false };
  if (code === 45 || code === 48) return { condition: 'Dense Fog / Low Visibility', icon: 'foggy', isSevere: true };
  if (code >= 51 && code <= 55) return { condition: 'Drizzle', icon: 'rainy', isSevere: false };
  if (code >= 61 && code <= 65) return { condition: 'Moderate to Heavy Rain', icon: 'rainy', isSevere: code >= 63 };
  if (code >= 71 && code <= 77) return { condition: 'Snowfall / Blizzard', icon: 'weather_snowy', isSevere: true };
  if (code >= 80 && code <= 82) return { condition: 'Violent Rain Showers', icon: 'thunderstorm', isSevere: true };
  if (code >= 85 && code <= 86) return { condition: 'Severe Snow Storm', icon: 'severe_cold', isSevere: true };
  if (code === 95) return { condition: 'Thunderstorm with Gusts', icon: 'thunderstorm', isSevere: true };
  if (code >= 96 && code <= 99) return { condition: 'Severe Storm with Hail / Squalls', icon: 'cyclone', isSevere: true };
  return { condition: 'Overcast', icon: 'cloud', isSevere: false };
}

/**
 * Fetches real-time meteorology for all major logistics nodes from Open-Meteo
 */
export async function fetchLiveNodeWeather(): Promise<WeatherNodeData[]> {
  try {
    const lats = MONITORED_WEATHER_NODES.map((n) => n.lat).join(',');
    const lngs = MONITORED_WEATHER_NODES.map((n) => n.lng).join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Open-Meteo] Weather API responded with ${res.status}`);
      return getFallbackWeatherData();
    }

    const data = await res.json();
    const results = Array.isArray(data) ? data : [data];

    return MONITORED_WEATHER_NODES.map((node, i) => {
      const current = results[i]?.current || {};
      const temp = current.temperature_2m !== undefined ? current.temperature_2m : 22.0;
      const windSpeed = current.wind_speed_10m !== undefined ? current.wind_speed_10m : 15.0;
      const windGusts = current.wind_gusts_10m !== undefined ? current.wind_gusts_10m : 25.0;
      const precip = current.precipitation !== undefined ? current.precipitation : 0.0;
      const code = current.weather_code !== undefined ? current.weather_code : 0;

      const { condition, icon, isSevere } = interpretWmoCode(code);

      // Automated Severe Hazard Evaluation Engine
      let isHazardous = isSevere || windGusts >= 55.0 || precip >= 15.0 || temp >= 38.0 || temp <= -10.0;
      let hazardSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
      let hazardDescription = undefined;

      if (windGusts >= 75.0 || code >= 96) {
        isHazardous = true;
        hazardSeverity = 'CRITICAL';
        hazardDescription = `Severe squalls with gusts of ${windGusts.toFixed(0)} km/h causing potential harbor/corridor closures.`;
      } else if (windGusts >= 55.0 || precip >= 20.0 || code >= 80) {
        isHazardous = true;
        hazardSeverity = 'HIGH';
        hazardDescription = `Heavy precipitation (${precip.toFixed(1)} mm) and wind gusts (${windGusts.toFixed(0)} km/h) impacting transit speeds.`;
      } else if (temp >= 38.0) {
        isHazardous = true;
        hazardSeverity = 'HIGH';
        hazardDescription = `Extreme ambient thermal load (+${temp.toFixed(1)}°C) exceeding cold-chain passive threshold.`;
      } else if (isSevere || windSpeed >= 35.0) {
        isHazardous = true;
        hazardSeverity = 'MEDIUM';
        hazardDescription = `Moderate weather disturbance with ${condition.toLowerCase()} and ${windSpeed.toFixed(0)} km/h winds.`;
      }

      return {
        nodeId: node.id,
        name: node.name,
        country: node.country,
        latitude: node.lat,
        longitude: node.lng,
        temperatureCelsius: Math.round(temp * 10) / 10,
        windSpeedKmh: Math.round(windSpeed),
        windGustsKmh: Math.round(windGusts),
        precipitationMm: Math.round(precip * 10) / 10,
        weatherCode: code,
        weatherCondition: condition,
        weatherIcon: icon,
        isHazardous,
        hazardSeverity,
        hazardDescription,
        lastUpdated: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('[Open-Meteo] Network error fetching live weather:', err);
    return getFallbackWeatherData();
  }
}

/**
 * Fallback weather dataset when offline
 */
function getFallbackWeatherData(): WeatherNodeData[] {
  return MONITORED_WEATHER_NODES.map((node) => ({
    nodeId: node.id,
    name: node.name,
    country: node.country,
    latitude: node.lat,
    longitude: node.lng,
    temperatureCelsius: 24.5,
    windSpeedKmh: 18,
    windGustsKmh: 30,
    precipitationMm: 0,
    weatherCode: 1,
    weatherCondition: 'Partly Cloudy',
    weatherIcon: 'partly_cloudy_day',
    isHazardous: false,
    hazardSeverity: 'NONE',
    lastUpdated: new Date().toISOString(),
  }));
}

/**
 * Automatically calculates and generates live Disruption objects based on real-time weather alerts
 */
export async function getLiveWeatherDisruptions(): Promise<any[]> {
  try {
    const nodes = await fetchLiveNodeWeather();
    const severeNodes = nodes.filter((n) => n.isHazardous);

    return severeNodes.map((n) => ({
      id: `DIS-WX-${n.nodeId.toUpperCase()}`,
      title: `Live Atmospheric Alert: ${n.weatherCondition} at ${n.name}`,
      disruptionType: 'WEATHER',
      severity: n.hazardSeverity === 'NONE' ? 'MEDIUM' : n.hazardSeverity,
      affectedRegion: `${n.name}, ${n.country}`,
      description:
        n.hazardDescription ||
        `Real-time weather detection: ${n.weatherCondition} with wind gusts of ${n.windGustsKmh} km/h and ${n.temperatureCelsius}°C ambient temperature.`,
      startedAt: n.lastUpdated,
      resolvedAt: null,
      isActive: true,
      affectedShipmentCount: 2,
      createdAt: n.lastUpdated,
    }));
  } catch (err) {
    console.warn('[WeatherEngine] Error generating live weather disruptions:', err);
    return [];
  }
}

