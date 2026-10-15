const { test } = require('node:test');
const assert = require('node:assert/strict');
const { check } = require('../scripts/supabase-keepalive.cjs');
const config = { SUPABASE_URL: 'https://dafqbhphoeblxpfrizwx.supabase.co', SUPABASE_ANON_KEY: 'public-test-key' };
const success = () => new Response('[{"id":1}]');

test('keepalive reads only one public site id with anonymous key', async () => {
  await check({ config, fetchImpl: async (url, options) => {
    assert.equal(url.pathname, '/rest/v1/site_copy');
    assert.equal(url.search, '?select=id&limit=1');
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.apikey, 'public-test-key');
    assert.equal(options.headers.Authorization, undefined);
    assert.ok(options.signal instanceof AbortSignal);
    return success();
  } });
});

test('keepalive retries transient errors and then succeeds', async () => {
  let calls = 0;
  const delays = [];
  await check({ config, sleep: async ms => delays.push(ms), fetchImpl: async () => {
    calls++;
    if (calls === 1) throw new Error('Network timeout');
    return calls === 2 ? new Response('', { status: 503 }) : success();
  } });
  assert.equal(calls, 3);
  assert.deepEqual(delays, [2000, 4000]);
});

test('keepalive fails immediately on authorization errors and empty data', async () => {
  for (const response of [new Response('', { status: 401 }), new Response('[]')]) {
    let calls = 0;
    await assert.rejects(check({ config, fetchImpl: async () => { calls++; return response; } }));
    assert.equal(calls, 1);
  }
});

test('keepalive stops after three transient failures', async () => {
  let calls = 0;
  await assert.rejects(check({ config, sleep: async () => {}, fetchImpl: async () => {
    calls++;
    return new Response('', { status: 503 });
  } }), /HTTP 503/);
  assert.equal(calls, 3);
});
