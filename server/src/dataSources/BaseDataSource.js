const cacheManager = require('./cache/cacheManager');
const dataSourcesConfig = require('../config/dataSources');
const logger = require('../utils/logger');

/**
 * Base Data Source
 * Enforces hierarchy: PRIMARY LIVE -> SECONDARY LIVE -> CACHE -> DEMO FALLBACK
 * Guarantees zero fake data and logs observability telemetry
 */
class BaseDataSource {
  constructor(name, defaultTtlSeconds = 900) {
    this.name = name;
    this.defaultTtl = defaultTtlSeconds;
    this.telemetry = {
      name: this.name,
      status: 'INITIALIZING',
      lastLatencyMs: 0,
      lastSuccessfulFetch: null,
      lastFailure: null,
      fetchCount: 0,
      failureCount: 0
    };
  }

  getMode() {
    return dataSourcesConfig.dataMode || 'hybrid';
  }

  updateTelemetrySuccess(latencyMs, source) {
    this.telemetry.status = 'CONNECTED';
    this.telemetry.lastLatencyMs = latencyMs;
    this.telemetry.lastSuccessfulFetch = new Date().toISOString();
    this.telemetry.lastSource = source;
    this.telemetry.fetchCount++;
  }

  updateTelemetryFailure(error) {
    this.telemetry.status = 'DEGRADED';
    this.telemetry.lastFailure = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    this.telemetry.failureCount++;
  }

  /**
   * Helper to execute HTTP requests with retry and exponential backoff
   */
  async executeWithRetry(fn, retries = 2, delayMs = 600) {
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          const waitTime = delayMs * Math.pow(2, attempt);
          logger.warn(`[${this.name}] Request failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}. Retrying in ${waitTime}ms...`);
          await new Promise(res => setTimeout(res, waitTime));
        }
      }
    }
    throw lastError;
  }

  /**
   * Standard execute template
   */
  async fetchWithFallback({
    params = {},
    cacheNamespace = this.name,
    ttl = this.defaultTtl,
    primaryFetcher = null,
    secondaryFetcher = null,
    demoFetcher = null
  }) {
    const mode = this.getMode();
    const startTime = Date.now();

    // 1. Strict DEMO mode requested
    if (mode === 'demo') {
      if (!demoFetcher) throw new Error(`[${this.name}] Demo fetcher not implemented`);
      const demoData = await demoFetcher(params);
      return {
        ...demoData,
        dataMode: 'demo',
        isLive: false,
        source: demoData.source || 'ORCA Calibrated Demo Baseline',
        retrievedAt: new Date().toISOString(),
        disclaimer: 'DEMO DATA — System operating in offline demonstration mode'
      };
    }

    // 2. Check Cache
    const cached = cacheManager.get(cacheNamespace, params);
    if (cached) {
      return {
        ...cached.payload,
        dataMode: mode === 'hybrid' ? 'hybrid' : 'live',
        isLive: false,
        isCached: true,
        source: cached.source,
        retrievedAt: cached.retrievedAt,
        cachedAt: cached.retrievedAt,
        expiresAt: new Date(cached.expiresAt).toISOString()
      };
    }

    // 3. Try Primary Live Source
    if (primaryFetcher) {
      try {
        const liveResult = await this.executeWithRetry(() => primaryFetcher(params), 1, 500);
        if (liveResult) {
          const latencyMs = Date.now() - startTime;
          this.updateTelemetrySuccess(latencyMs, liveResult.source || this.name);
          cacheManager.set(cacheNamespace, params, liveResult, ttl, liveResult.source || this.name);
          return {
            ...liveResult,
            dataMode: 'live',
            isLive: true,
            isCached: false,
            retrievedAt: new Date().toISOString(),
            latencyMs
          };
        }
      } catch (err) {
        logger.warn(`[${this.name}] Primary fetcher failed: ${err.message}`);
        this.updateTelemetryFailure(err);
      }
    }

    // 4. Try Secondary Live Source
    if (secondaryFetcher) {
      try {
        const secondaryResult = await this.executeWithRetry(() => secondaryFetcher(params), 1, 500);
        if (secondaryResult) {
          const latencyMs = Date.now() - startTime;
          this.updateTelemetrySuccess(latencyMs, secondaryResult.source || `${this.name} Secondary`);
          cacheManager.set(cacheNamespace, params, secondaryResult, ttl, secondaryResult.source || `${this.name} Secondary`);
          return {
            ...secondaryResult,
            dataMode: 'live',
            isLive: true,
            isCached: false,
            retrievedAt: new Date().toISOString(),
            latencyMs
          };
        }
      } catch (err) {
        logger.warn(`[${this.name}] Secondary fetcher failed: ${err.message}`);
      }
    }

    // 5. Fallback Handling
    if (mode === 'live') {
      // Rule 3 & 47: Never fabricate fake live data in LIVE mode!
      return {
        dataMode: 'live',
        isLive: false,
        source: this.name,
        retrievedAt: new Date().toISOString(),
        error: 'LIVE DATA UNAVAILABLE',
        message: `Unable to retrieve live data from ${this.name} services.`
      };
    }

    // 6. In HYBRID mode, fallback gracefully to Demo Data with explicit labels
    if (demoFetcher) {
      logger.info(`[${this.name}] Live sources unavailable in HYBRID mode. Serving transparent demo fallback.`);
      const demoData = await demoFetcher(params);
      return {
        ...demoData,
        dataMode: 'hybrid',
        isLive: false,
        source: demoData.source || 'ORCA Calibrated Demo Baseline',
        retrievedAt: new Date().toISOString(),
        note: 'Live source unavailable — displaying calibrated demo baseline',
        disclaimer: 'DEMO DATA (HYBRID FALLBACK)'
      };
    }

    throw new Error(`[${this.name}] All data sources failed and no fallback available.`);
  }

  getTelemetry() {
    return { ...this.telemetry };
  }
}

module.exports = BaseDataSource;
