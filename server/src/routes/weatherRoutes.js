const express = require('express');
const router = express.Router();
const { getCurrentWeather, getWeatherForecast } = require('../controllers/weatherController');

router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);

module.exports = router;
