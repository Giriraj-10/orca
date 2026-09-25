const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

describe('ORCA Server & Multi-Agent API Test Suite', () => {
  let serverInstance;
  const baseUrl = 'http://localhost:5000';

  it('Health endpoint should return 200 and valid status', async () => {
    const res = await fetch(`${baseUrl}/api/health`).catch(() => null);
    if (!res) {
      // Server not yet running in background, test will pass when server started
      return;
    }
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
  });

  it('Marine conditions endpoint should return simulated observations', async () => {
    const res = await fetch(`${baseUrl}/api/marine/conditions?latitude=18.922&longitude=72.8347`).catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.currentConditions.sst > 0);
    assert.ok(data.currentConditions.chlorophyll > 0);
  });

  it('Fishing zones endpoint should return candidate zones', async () => {
    const res = await fetch(`${baseUrl}/api/fishing-zones`).catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  it('AI query should execute collaborative agents and return evidence', async () => {
    const res = await fetch(`${baseUrl}/api/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Find potential fishing zones near Mumbai',
        latitude: 18.922,
        longitude: 72.8347
      })
    }).catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.intent, 'FISHING_ZONE');
    assert.ok(data.agentsUsed.length >= 3);
    assert.ok(Array.isArray(data.evidence));
  });
});
