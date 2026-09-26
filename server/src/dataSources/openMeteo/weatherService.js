const weatherClient = require('./weatherClient');
const weatherNormalizer = require('./weatherNormalizer');

class OpenMeteoWeatherService {
  async getWeather(latitude, longitude, targetDate = null) {
    const raw = await weatherClient.fetchWeather(latitude, longitude, targetDate);
    return weatherNormalizer.normalize(raw, targetDate);
  }
}

module.exports = new OpenMeteoWeatherService();
