const imdClient = require('./imdClient');
const imdNormalizer = require('./imdNormalizer');

class ImdService {
  isConfigured() {
    return imdClient.isConfigured();
  }

  async getWeather(latitude, longitude) {
    const raw = await imdClient.fetchObservation(latitude, longitude);
    return imdNormalizer.normalize(raw);
  }

  async getWarnings(latitude, longitude) {
    const raw = await imdClient.fetchWarnings(latitude, longitude);
    return imdNormalizer.normalizeWarnings(raw);
  }
}

module.exports = new ImdService();
