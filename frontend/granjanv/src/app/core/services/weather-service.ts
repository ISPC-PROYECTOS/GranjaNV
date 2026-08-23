import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { OpenMeteoResponse, WeatherData } from '../models/weather';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);

//Localización: Forres, Santiago del Estero, Argentina
  private readonly DEFAULT_LAT = -27.8525;
  private readonly DEFAULT_LON = -63.9609;
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  getClimaActual(lat: number = this.DEFAULT_LAT, lon: number = this.DEFAULT_LON): Observable<WeatherData | null> {
    const url = `${this.BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability&timezone=auto&forecast_days=1`;

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map((res) => {
        const currentHour = new Date().getHours();
        const rainProb = res.hourly?.precipitation_probability?.[currentHour] ?? 0;
        const condition = this.mapWeatherCode(res.current.weather_code);
        const windDeg = res.current.wind_direction_10m;

        return {
          temperature: Math.round(res.current.temperature_2m),
          humidity: Math.round(res.current.relative_humidity_2m),
          windSpeed: Math.round(res.current.wind_speed_10m),
          windDirection: windDeg,
          windFlowRotation: (windDeg + 180) % 360, // Apunta hacia el destino del viento
          windDirectionText: this.getWindCardinalDirection(windDeg),
          precipitationProbability: rainProb,
          description: condition.description,
          iconClass: condition.iconClass
        };
      }),
      catchError((error) => {
        console.error('Error al consultar Open-Meteo:', error);
        return of(null);
      })
    );
  }

  private getWindCardinalDirection(degrees: number): string {
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return cardinals[index];
  }

  private mapWeatherCode(code: number): { description: string; iconClass: string } {
    switch (code) {
      case 0:
        return { description: 'Despejado', iconClass: 'hgi-sun-02' };
      case 1:
      case 2:
        return { description: 'Parcialmente nublado', iconClass: 'hgi-cloud-sun' };
      case 3:
        return { description: 'Nublado', iconClass: 'hgi-cloud-01' };
      case 45:
      case 48:
        return { description: 'Niebla', iconClass: 'hgi-cloud-fog' };
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
        return { description: 'Lluvia', iconClass: 'hgi-rain' };
      case 71:
      case 73:
      case 75:
        return { description: 'Nieve', iconClass: 'hgi-snow' };
      case 80:
      case 81:
      case 82:
        return { description: 'Chubascos', iconClass: 'hgi-rain-cloud' };
      case 95:
      case 96:
      case 99:
        return { description: 'Tormenta', iconClass: 'hgi-thunderstorm' };
      default:
        return { description: 'Templado', iconClass: 'hgi-cloud-sun' };
    }
  }
}