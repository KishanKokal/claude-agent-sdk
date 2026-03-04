export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentWeather;
}

export interface CurrentUnits {
  time: string; // e.g., "iso8601"
  interval: string; // e.g., "seconds"
  temperature_2m: string; // e.g., "°C"
}

export interface CurrentWeather {
  time: string; // ISO 8601 datetime string
  interval: number; // seconds
  temperature_2m: number; // temperature value
}
