const dsm = require('../dataSources/DataSourceManager');

// @desc    Get current weather for coordinates
// @route   GET /api/weather/current
const getCurrentWeather = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;
    const targetDate = req.query.targetDate || null;

    const weather = await dsm.weather.getWeather(lat, lng, targetDate);
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weather forecast and hourly trend array
// @route   GET /api/weather/forecast
const getWeatherForecast = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;

    const weather = await dsm.weather.getWeather(lat, lng);
    res.json({
      success: true,
      location: weather.location,
      current: {
        temperature: weather.temperature,
        apparentTemperature: weather.apparentTemperature,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        precipitation: weather.precipitation,
        visibility: weather.visibility,
        condition: weather.condition
      },
      hourlyTrends: weather.hourlyTrends || [],
      source: weather.source,
      dataMode: weather.dataMode,
      isLive: weather.isLive,
      timestamp: weather.timestamp
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherForecast
};
