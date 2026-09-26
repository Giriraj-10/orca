/**
 * Open-Meteo Weather Normalizer
 */

class OpenMeteoWeatherNormalizer {
  getCompassDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round((degrees % 360) / 22.5) % 16;
    return directions[idx];
  }

  getWeatherCondition(code) {
    switch (code) {
      case 0: return 'Clear Sky';
      case 1: return 'Mainly Clear';
      case 2: return 'Partly Cloudy';
      case 3: return 'Overcast';
      case 45: case 48: return 'Coastal Fog & Reduced Visibility';
      case 51: case 53: case 55: return 'Light Coastal Drizzle';
      case 61: case 63: case 65: return 'Rain / Coastal Downpour';
      case 80: case 81: case 82: return 'Squall Showers';
      case 95: return 'Thunderstorm Warning';
      case 96: case 99: return 'Severe Marine Thunderstorm & Hail';
      default: return 'Fair Coastal Weather';
    }
  }

  normalize(raw, targetDate = null) {
    if (!raw || !raw.current) {
      throw new Error('Invalid Open-Meteo Weather response format');
    }

    const { latitude, longitude, current, hourly } = raw;

    const temp = current.temperature_2m ?? 28;
    const apparentTemp = current.apparent_temperature ?? temp;
    const windSpeed = current.wind_speed_10m ?? 12; // km/h
    const windDirectionDeg = current.wind_direction_10m ?? 240;
    const precipitation = current.precipitation ?? 0;
    const visibilityKm = current.visibility ? Number((current.visibility / 1000).toFixed(1)) : 10.0;
    const weatherCode = current.weather_code ?? 0;

    // Compile hourly trend
    const hourlyTrends = [];
    if (hourly && hourly.time) {
      const limit = Math.min(24, hourly.time.length);
      for (let i = 0; i < limit; i++) {
        hourlyTrends.push({
          time: hourly.time[i].includes('T') ? hourly.time[i].split('T')[1].substring(0, 5) : hourly.time[i],
          isoTime: hourly.time[i],
          temp: hourly.temperature_2m?.[i] ?? temp,
          windSpeed: hourly.wind_speed_10m?.[i] ?? windSpeed,
          precipitation: hourly.precipitation?.[i] ?? 0,
          condition: this.getWeatherCondition(hourly.weather_code?.[i] ?? 0)
        });
      }
    }

    return {
      location: {
        latitude,
        longitude
      },
      timestamp: current.time || new Date().toISOString(),
      temperature: Number(temp.toFixed(1)),
      apparentTemperature: Number(apparentTemp.toFixed(1)),
      windSpeed: Number(windSpeed.toFixed(1)), // km/h
      windDirection: this.getCompassDirection(windDirectionDeg),
      windDirectionDegrees: Math.round(windDirectionDeg),
      precipitation: Number(precipitation.toFixed(1)),
      visibility: visibilityKm,
      weatherCode: weatherCode,
      condition: this.getWeatherCondition(weatherCode),
      hourlyTrends,
      source: 'Open-Meteo High-Resolution Weather API',
      isLive: true
    };
  }
}

module.exports = new OpenMeteoWeatherNormalizer();
