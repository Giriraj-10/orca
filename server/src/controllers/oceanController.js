const dsm = require('../dataSources/DataSourceManager');
const sstService = require('../dataSources/satellite/sstService');
const chlorophyllService = require('../dataSources/satellite/chlorophyllService');

// @desc    Get dynamic Sea Surface Temperature (SST)
// @route   GET /api/ocean/sst
const getSST = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;

    const sst = await sstService.getSST(lat, lng);
    res.json({
      success: true,
      data: sst
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Chlorophyll concentration
// @route   GET /api/ocean/chlorophyll
const getChlorophyll = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;

    const chl = await chlorophyllService.getChlorophyll(lat, lng);
    res.json({
      success: true,
      data: chl
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSST,
  getChlorophyll
};
