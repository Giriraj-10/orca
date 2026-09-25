const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');

const User = require('../models/User');
const MarineObservation = require('../models/MarineObservation');
const WeatherObservation = require('../models/WeatherObservation');
const OceanObservation = require('../models/OceanObservation');
const FishingZone = require('../models/FishingZone');
const Alert = require('../models/Alert');
const DataSource = require('../models/DataSource');

const {
  getDemoUsers,
  generateMarineObservations,
  generateWeatherObservations,
  generateOceanObservations,
  generateFishingZones,
  generateAlerts,
  generateDataSources
} = require('./seedData');

async function seedDatabase() {
  logger.info('Starting ORCA Database Seeding Process...');

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.success(`Connected to MongoDB for seeding: ${conn.connection.name}`);

    // Clear existing demo collections
    logger.info('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      MarineObservation.deleteMany({}),
      WeatherObservation.deleteMany({}),
      OceanObservation.deleteMany({}),
      FishingZone.deleteMany({}),
      Alert.deleteMany({}),
      DataSource.deleteMany({})
    ]);

    // Insert Users (using User.create so bcrypt pre-save hook triggers)
    logger.info('Inserting demo user personas...');
    const demoUsers = getDemoUsers();
    for (const u of demoUsers) {
      await User.create(u);
    }
    logger.success(`Seeded ${demoUsers.length} user accounts`);

    // Insert Marine Observations
    const marineObs = generateMarineObservations();
    await MarineObservation.insertMany(marineObs);
    logger.success(`Seeded ${marineObs.length} marine observations across coastal sectors`);

    // Insert Weather Observations
    const weatherObs = generateWeatherObservations();
    await WeatherObservation.insertMany(weatherObs);
    logger.success(`Seeded ${weatherObs.length} weather observations`);

    // Insert Ocean Observations
    const oceanObs = generateOceanObservations();
    await OceanObservation.insertMany(oceanObs);
    logger.success(`Seeded ${oceanObs.length} oceanographic buoy records`);

    // Insert Fishing Zones
    const fishingZones = generateFishingZones();
    await FishingZone.insertMany(fishingZones);
    logger.success(`Seeded ${fishingZones.length} potential fishing zones`);

    // Insert Alerts
    const alerts = generateAlerts();
    await Alert.insertMany(alerts);
    logger.success(`Seeded ${alerts.length} active maritime alerts`);

    // Insert Data Sources
    const dataSources = generateDataSources();
    await DataSource.insertMany(dataSources);
    logger.success(`Seeded ${dataSources.length} marine data sources`);

    logger.success('========================================================');
    logger.success('ORCA DATABASE SEEDED SUCCESSFULLY FOR SIH DEMO!');
    logger.success('Demo Credentials:');
    logger.success('  Fisherman: fisherman@orca.demo  | Password: ORCA@123');
    logger.success('  Researcher: researcher@orca.demo | Password: ORCA@123');
    logger.success('  Authority:  authority@orca.demo  | Password: ORCA@123');
    logger.success('  Admin:      admin@orca.demo      | Password: ORCA@123');
    logger.success('========================================================');

    return true;
  } catch (err) {
    logger.error(`Error seeding database: ${err.message}`);
    return false;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('Mongoose disconnected after seed operation.');
    }
  }
}

// If invoked directly from CLI
if (require.main === module) {
  seedDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = seedDatabase;
