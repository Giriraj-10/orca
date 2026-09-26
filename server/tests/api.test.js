process.env.NODE_ENV = 'test';
process.env.DATA_MODE = 'hybrid';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { app } = require('../src/server');

describe('ORCA API-Driven Multi-Agent Test Suite', () => {
  let serverInstance;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      serverInstance = app.listen(0, () => {
        const port = serverInstance.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
  });

  // 1. Weather endpoint
  it('1. Weather endpoint should return weather data with source metadata', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?lat=18.922&lng=72.8347`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.temperature !== undefined);
    assert.ok(data.data.windSpeed !== undefined);
    assert.ok(data.data.source, 'Must have source metadata');
    assert.ok(data.data.retrievedAt, 'Must have retrievedAt timestamp');
  });

  // 2. Marine endpoint
  it('2. Marine endpoint should return dynamic wave, swell, and SST', async () => {
    const res = await fetch(`${baseUrl}/api/marine/conditions?lat=18.922&lng=72.8347`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.currentConditions.waveHeight !== undefined);
    assert.ok(data.currentConditions.sst !== undefined);
    assert.ok(data.source, 'Must have source metadata');
  });

  // 3. Location changes produce different outputs
  it('3. Location changes should produce location-specific results', async () => {
    const [resMumbai, resKochi] = await Promise.all([
      fetch(`${baseUrl}/api/marine/conditions?lat=18.922&lng=72.8347`).then(r => r.json()),
      fetch(`${baseUrl}/api/marine/conditions?lat=9.9312&lng=76.2673`).then(r => r.json())
    ]);

    assert.ok(resMumbai.success);
    assert.ok(resKochi.success);
    assert.notStrictEqual(resMumbai.location.latitude, resKochi.location.latitude);
  });

  // 4. Time changes produce forecast data
  it('4. Time changes should return hourly forecast progression', async () => {
    const res = await fetch(`${baseUrl}/api/marine/forecast?lat=18.922&lng=72.8347&days=2`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.forecast) || Array.isArray(data.hourly));
  });

  // 5. Risk calculation is dynamic and deterministic
  it('5. Risk score should dynamically compute based on input conditions', async () => {
    const [calmRisk, roughRisk] = await Promise.all([
      fetch(`${baseUrl}/api/risk/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waveHeight: 0.8, windSpeed: 10, visibility: 12, alertsCount: 0 })
      }).then(r => r.json()),
      fetch(`${baseUrl}/api/risk/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waveHeight: 3.2, windSpeed: 45, visibility: 2, alertsCount: 2 })
      }).then(r => r.json())
    ]);

    assert.ok(calmRisk.assessment.overallScore < roughRisk.assessment.overallScore);
    assert.strictEqual(calmRisk.assessment.riskLevel, 'LOW');
    assert.ok(['HIGH', 'CRITICAL', 'SEVERE'].includes(roughRisk.assessment.riskLevel));
  });

  // 6. Dynamic safest route calculation
  it('6. Route optimizer should compute dynamic waypoint path', async () => {
    const res = await fetch(`${baseUrl}/api/routes/safest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: [72.8347, 18.922],
        destination: [72.6500, 19.1000]
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.route.type, 'Feature');
    assert.strictEqual(data.route.geometry.type, 'LineString');
    assert.ok(data.route.geometry.coordinates.length >= 2);
  });

  // 7. PFZ query is dynamic with attribution
  it('7. PFZ query should return candidate zones with source attribution', async () => {
    const res = await fetch(`${baseUrl}/api/pfz/nearby?lat=18.922&lng=72.8347&radius=100`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
    assert.ok(data.data[0].source, 'PFZ must have source attribution');
  });

  // 8. Alerts are dynamic
  it('8. Alerts should be returned dynamically based on location', async () => {
    const res = await fetch(`${baseUrl}/api/alerts?lat=18.922&lng=72.8347`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  // 9. AI query uses tools and returns grounded evidence
  it('9. AI Chat query should orchestrate agents and return grounded evidence chain', async () => {
    const res = await fetch(`${baseUrl}/api/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Is it safe to sail tomorrow morning?',
        latitude: 18.922,
        longitude: 72.8347,
        targetDate: 'tomorrow_morning'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.intent, 'Must detect intent');
    assert.ok(data.evidence && Array.isArray(data.evidence), 'Must provide structured evidence');
    assert.ok(data.evidence.length > 0, 'Evidence array must not be empty');
    assert.ok(data.evidence[0].source, 'Evidence items must contain source attribution');
  });

  // 10. Data sources health & telemetry endpoint
  it('10. System data-sources endpoint should report provider status and dataMode', async () => {
    const res = await fetch(`${baseUrl}/api/system/data-sources`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.dataMode, 'Must return active dataMode');
    assert.ok(Array.isArray(data.data));
  });
});
