export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;         // Grados meteorológicos de origen (0° - 360°)
  windFlowRotation: number;      // Grados de rotación visual para la flecha (hacia dónde va)
  windDirectionText: string;     // Punto cardinal de origen (ej: "N", "SE")
  precipitationProbability: number;
  description: string;
  iconClass: string;
}

export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    precipitation_probability: number[];
  };
}