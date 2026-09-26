/**
 * In-Memory & Resilient Cache Manager for External APIs
 * Keeps track of cached requests, expiration timestamps, and metadata
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  generateKey(namespace, params = {}) {
    const sorted = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join('|');
    return `${namespace}::${sorted}`;
  }

  get(namespace, params = {}) {
    const key = this.generateKey(namespace, params);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(namespace, params = {}, payload, ttlSeconds = 900, source = 'External API') {
    const key = this.generateKey(namespace, params);
    const now = Date.now();
    const entry = {
      key,
      namespace,
      params,
      source,
      retrievedAt: new Date(now).toISOString(),
      expiresAt: now + (ttlSeconds * 1000),
      payload
    };
    this.cache.set(key, entry);
    return entry;
  }

  has(namespace, params = {}) {
    return Boolean(this.get(namespace, params));
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    let activeEntries = 0;
    const now = Date.now();
    for (const [_, entry] of this.cache.entries()) {
      if (entry.expiresAt > now) activeEntries++;
    }
    return {
      totalEntries: this.cache.size,
      activeEntries
    };
  }
}

module.exports = new CacheManager();
