const BaseDataSource = require('./BaseDataSource');
const imdService = require('./imd/imdService');
const openMeteoWeather = require('./openMeteo/weatherService');
const { DemoWeatherProvider } = require('../providers/WeatherProvider');
const demoWeather = new DemoWeatherProvider();

class WeatherDataSource extends BaseDataSource {
  constructor() {
    super('Weather Data Source', 600); // 10 min TTL
  }

  async getWeather(latitude, longitude, targetDate = null) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    return this.fetchWithFallback({
      params: { latitude: lat, longitude: lng, targetDate },
      cacheNamespace: 'weather',
      primaryFetcher: async (p) => {
        if (imdService.isConfigured()) {
          return await imdService.getWeather(p.latitude, p.longitude);
        }
        // If IMD not configured, Open-Meteo is the active primary live provider
        return await openMeteoWeather.getWeather(p.latitude, p.longitude, p.targetDate);
      },
      secondaryFetcher: async (p) => {
        // If IMD was primary and failed, Open-Meteo is secondary
        return await openMeteoWeather.getWeather(p.latitude, p.longitude, p.targetDate);
      },
      demoFetcher: async (p) => {
        return await demoWeather.getWeather(p.latitude, p.longitude, p.targetDate);
      }
    });
  }
}

module.exports = new WeatherDataSource();
