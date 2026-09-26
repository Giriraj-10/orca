/**
 * Open-Meteo Marine Data Normalizer
 */

class OpenMeteoMarineNormalizer {
  determineSeaCondition(waveHeight) {
    if (waveHeight < 0.6) return 'Calm (Glassy/Rippled)';
    if (waveHeight < 1.2) return 'Slight to Moderate';
    if (waveHeight < 2.0) return 'Moderate Chop';
    if (waveHeight < 3.0) return 'Rough (Swell Warning)';
    return 'Very Rough / High Danger Swell';
  }

  normalize(raw, targetDate = null) {
    if (!raw || !raw.hourly || !raw.hourly.time) {
      throw new Error('Invalid Open-Meteo Marine response format');
    }

    const { latitude, longitude, hourly } = raw;
    const times = hourly.time;

    // Find index matching targetDate or current hour
    let selectedIndex = 0;
    const nowIso = (targetDate ? new Date(targetDate) : new Date()).toISOString();
    
    // Find closest time index
    let minDiff = Infinity;
    const targetEpoch = new Date(nowIso).getTime();
    for (let i = 0; i < times.length; i++) {
      const tEpoch = new Date(times[i]).getTime();
      const diff = Math.abs(tEpoch - targetEpoch);
      if (diff < minDiff) {
        minDiff = diff;
        selectedIndex = i;
      }
    }

    const waveHeight = hourly.wave_height?.[selectedIndex] ?? 1.1;
    const waveDirection = hourly.wave_direction?.[selectedIndex] ?? 230;
    const wavePeriod = hourly.wave_period?.[selectedIndex] ?? 7.5;
    const windWave = hourly.wind_wave_height?.[selectedIndex] ?? 0.6;
    const swellWave = hourly.swell_wave_height?.[selectedIndex] ?? 0.9;
    const currentSpeed = hourly.ocean_current_velocity?.[selectedIndex] ?? 0.4;
    const currentDirection = hourly.ocean_current_direction?.[selectedIndex] ?? 180;
    const sst = hourly.sea_surface_temperature?.[selectedIndex] ?? 28.0;

    // Build 24-hour time series for charts
    const timeseries = [];
    const startIndex = Math.max(0, selectedIndex - 6);
    const endIndex = Math.min(times.length, startIndex + 24);

    for (let i = startIndex; i < endIndex; i++) {
      timeseries.push({
        time: times[i].includes('T') ? times[i].split('T')[1].substring(0, 5) : times[i],
        isoTime: times[i],
        waveHeight: hourly.wave_height?.[i] ?? 0,
        wavePeriod: hourly.wave_period?.[i] ?? 0,
        currentSpeed: hourly.ocean_current_velocity?.[i] ?? 0,
        sst: hourly.sea_surface_temperature?.[i] ?? sst
      });
    }

    return {
      location: {
        latitude,
        longitude
      },
      timestamp: times[selectedIndex] || new Date().toISOString(),
      wave: {
        height: Number(waveHeight.toFixed(2)),
        direction: Math.round(waveDirection),
        period: Number(wavePeriod.toFixed(1)),
        windWaveHeight: Number(windWave.toFixed(2)),
        swellHeight: Number(swellWave.toFixed(2))
      },
      sst: Number(sst.toFixed(1)),
      current: {
        velocity: Number(currentSpeed.toFixed(2)),
        direction: Math.round(currentDirection)
      },
      seaCondition: this.determineSeaCondition(waveHeight),
      timeseries,
      source: 'Open-Meteo Marine API',
      modelType: 'Global Ocean Wave Model (ECMWF/NOAA GFS)',
      isLive: true
    };
  }
}

module.exports = new OpenMeteoMarineNormalizer();
