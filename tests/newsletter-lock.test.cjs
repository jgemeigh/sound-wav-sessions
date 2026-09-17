const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('supabase/functions/broadcast-newsletter/index.ts', 'utf8');
const handlerSource = source.slice(source.indexOf('serve(async (request)'))
  .replace(/\.(single|maybeSingle)<\w+>\(/g, '.$1(')
  .replace('const responses: unknown[]', 'const responses');

function setup(fields = {}, failSend = false) {
  const row = { id: 'newsletter', is_current: true, subject: 'Test', body: 'Test', ...fields };
  let sends = 0;
  let handler;
  const client = {
    auth: { getUser: async () => ({ data: { user: { app_metadata: { is_admin: true } } } }) },
    from(table) {
      let update;
      const conditions = [];
      const query = {
        select() { return query; },
        eq(key, value) { conditions.push(() => row[key] === value); return query; },
        is(key, value) { conditions.push(() => (row[key] ?? null) === value); return query; },
        or(expression) { conditions.push(() => !row.broadcast_started_at || row.broadcast_started_at < expression.split('.lt.')[1]); return query; },
        update(value) { update = value; return query; },
        order() { return query; },
        single() { return Promise.resolve({ data: { ...row } }); },
        maybeSingle() { return Promise.resolve(result()); },
        then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); }
      };
      function result() {
        if (table === 'newsletters') {
          if (update && !conditions.every(check => check())) return { data: null };
          if (update) Object.assign(row, update);
          return { data: { ...row } };
        }
        if (table === 'subscribers') return { data: [{ email: 'test@example.invalid' }] };
        return { data: table === 'upcoming_show' ? null : [] };
      }
      return query;
    }
  };
  vm.runInNewContext(handlerSource, {
    serve: fn => { handler = fn; }, Response, Date, Set,
    corsHeaders: {}, Deno: { env: { get: () => undefined } },
    requireEnv: () => 'test', createClient: () => client,
    json: (data, init) => new Response(JSON.stringify(data), init),
    newsletterHtml: () => '', chunk: items => [items], RECIPIENT_CHUNK_SIZE: 50,
    getGmailAccessToken: async () => 'mock',
    sendGmailMessage: async () => { sends++; if (failSend) throw new Error('Ambiguous Gmail failure'); return {}; }
  });
  return {
    row, sends: () => sends,
    call: (mode = 'live') => handler(new Request('https://example.invalid', {
      method: 'POST', headers: { Authorization: 'Bearer mock' },
      body: JSON.stringify({ newsletterId: row.id, mode })
    }))
  };
}

for (const field of ['broadcast_locked_at']) {
  test(`${field} blocks live and test sends`, async () => {
    const app = setup({ [field]: '2026-09-17T00:00:00Z' });
    assert.equal((await app.call()).status, 409);
    assert.equal((await app.call('test')).status, 409);
    assert.equal(app.sends(), 0);
  });
}
test('simultaneous broadcasts send only once', async () => {
  const app = setup();
  const results = await Promise.all([app.call(), app.call()]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal(app.sends(), 1);
  assert.ok(app.row.sent_at);
});
test('send failure releases temporary claim without creating a manual lock', async () => {
  const app = setup({}, true);
  assert.equal((await app.call()).status, 500);
  assert.equal(app.row.broadcast_started_at, null);
  assert.equal(app.row.broadcast_locked_at, undefined);
  assert.equal(app.sends(), 1);
});
test('test send leaves an unsent draft available for live broadcast', async () => {
  const app = setup();
  assert.equal((await app.call('test')).status, 200);
  assert.equal(app.row.broadcast_started_at, undefined);
  assert.equal((await app.call()).status, 200);
  assert.equal((await app.call()).status, 200);
});
test('previously sent newsletters can be broadcast again when unlocked', async () => {
  const app = setup({ sent_at: '2026-09-17T00:00:00Z' });
  assert.equal((await app.call()).status, 200);
  assert.equal(app.row.broadcast_started_at, null);
});
test('manual unlock allows sending again', async () => {
  const app = setup({ broadcast_locked_at: '2026-09-17T00:00:00Z' });
  assert.equal((await app.call()).status, 409);
  app.row.broadcast_locked_at = null;
  assert.equal((await app.call()).status, 200);
});
test('stale temporary claim expires', async () => {
  const app = setup({ broadcast_started_at: '2020-01-01T00:00:00Z' });
  assert.equal((await app.call()).status, 200);
});
test('admin inline scripts parse', () => {
  const html = fs.readFileSync('admin.html', 'utf8');
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    new vm.Script(match[1]);
  }
});
test('admin shows lock control for drafts and hides sending for every locked state', () => {
  const html = fs.readFileSync('admin.html', 'utf8');
  const start = html.indexOf('? newsletters.map((item) => {');
  const end = html.indexOf('}).join("")', start);
  const renderer = html.slice(start + '? newsletters.map('.length, end + 1);
  for (const editing of [false, true]) {
    for (const field of [null, 'sent_at', 'broadcast_locked_at', 'broadcast_started_at']) {
      const item = { id: 'fixture', subject: 'Fixture', body: 'Fixture', ...(field ? { [field]: '2026-09-17' } : {}) };
      const markup = vm.runInNewContext(`(${renderer})(item)`, {
        item, currentNewsletter: item, editingNewsletterId: editing ? item.id : '', Date
      });
      const locked = field === 'broadcast_locked_at';
      assert.equal(markup.includes('data-broadcast-newsletter-id'), !locked);
      assert.equal(markup.includes('data-test-broadcast-newsletter-id'), !locked);
      assert.equal(markup.includes('data-lock-newsletter-id'), true);
      assert.equal(markup.includes('Unlock broadcast'), locked);
      assert.equal(markup.includes('Broadcast locked'), locked);
      const nonCurrent = vm.runInNewContext(`(${renderer})(item)`, {
        item, currentNewsletter: { id: 'other' }, editingNewsletterId: editing ? item.id : '', Date
      });
      assert.equal(nonCurrent.includes('data-set-current-newsletter-id'), true);
    }
  }
});
