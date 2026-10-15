const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');

function publicConfig() {
  const context = { window: {} };
  runInNewContext(readFileSync(join(__dirname, '..', 'config.js'), 'utf8'), context, { timeout: 1000 });
  return context.window;
}

async function check({ config = publicConfig(), fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const url = new URL('/rest/v1/site_copy?select=id&limit=1', config.SUPABASE_URL);
  if (url.origin !== 'https://dafqbhphoeblxpfrizwx.supabase.co' || !config.SUPABASE_ANON_KEY) {
    throw new Error('Missing or unexpected public Supabase configuration');
  }
  // Use only the same anonymous read permission as a visitor; never admin credentials.
  const options = {
    method: 'GET',
    headers: { apikey: config.SUPABASE_ANON_KEY, Accept: 'application/json' },
    redirect: 'error',
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    let retryable = true;
    try {
      const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(20000) });
      if (!response.ok) {
        retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        throw new Error(`Public database check returned HTTP ${response.status}`);
      }
      const rows = await response.json();
      if (!Array.isArray(rows) || rows.length === 0 || rows[0].id == null) {
        retryable = false;
        throw new Error('Public database check returned no site configuration');
      }
      return;
    } catch (error) {
      if (!retryable || attempt === 2) throw error;
      await sleep(2000 * (attempt + 1));
    }
  }
}

if (require.main === module) {
  check().then(() => console.log('Public database read succeeded.')).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
module.exports = { check };
