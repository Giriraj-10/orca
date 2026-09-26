const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dataSourcesConfig = require('../../config/dataSources');
const logger = require('../../utils/logger');

class IncoisClient {
  constructor() {
    this.baseUrl = dataSourcesConfig.incois.baseUrl;
    this.feedUrl = dataSourcesConfig.incois.advisoryFeedUrl;
    this.timeout = dataSourcesConfig.apiTimeoutMs;
  }

  isConfigured() {
    return Boolean(this.feedUrl && this.feedUrl.trim() !== '');
  }

  /**
   * INCOIS Advisory Ingestion Adapter
   * Ingests official INCOIS text/JSON advisory format
   */
  async fetchLatestAdvisory(sector = 'all') {
    // 1. If live feed URL is configured, fetch dynamically
    if (this.isConfigured()) {
      try {
        logger.info(`[IncoisClient] Ingesting live INCOIS advisory feed from ${this.feedUrl}`);
        const response = await axios.get(this.feedUrl, {
          params: { sector },
          timeout: this.timeout
        });
        return {
          raw: response.data,
          sourceType: 'LIVE_FEED',
          sourceUrl: this.feedUrl
        };
      } catch (err) {
        logger.warn(`[IncoisClient] Remote INCOIS feed failed: ${err.message}. Checking local advisory repository.`);
      }
    }

    // 2. Check for locally ingested official INCOIS advisory bulletin files
    const localDir = path.resolve(__dirname, '../../data/incois');
    if (fs.existsSync(localDir)) {
      const files = fs.readdirSync(localDir).filter(f => f.endsWith('.json') || f.endsWith('.txt'));
      if (files.length > 0) {
        const latestFile = path.join(localDir, files[files.length - 1]);
        const content = fs.readFileSync(latestFile, 'utf8');
        try {
          return {
            raw: JSON.parse(content),
            sourceType: 'LOCAL_BULLETIN_FILE',
            fileName: path.basename(latestFile)
          };
        } catch {
          return {
            raw: content,
            sourceType: 'LOCAL_TEXT_BULLETIN',
            fileName: path.basename(latestFile)
          };
        }
      }
    }

    // If no operational feed or bulletin is deposited
    return null;
  }
}

module.exports = new IncoisClient();
