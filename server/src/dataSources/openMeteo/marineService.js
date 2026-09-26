const marineClient = require('./marineClient');
const marineNormalizer = require('./marineNormalizer');

class OpenMeteoMarineService {
  async getMarineConditions(latitude, longitude, targetDate = null) {
    const raw = await marineClient.fetchMarineConditions(latitude, longitude, targetDate);
    return marineNormalizer.normalize(raw, targetDate);
  }
}

module.exports = new OpenMeteoMarineService();
