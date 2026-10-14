const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(slug, options = {}) {
  let handler, emails = 0, inserts = 0, updates = 0;
  const source = fs.readFileSync(`supabase/functions/${slug}/index.ts`, 'utf8');
  const client = { from() {
    let action = 'select';
    const q = {
      insert() { action = 'insert'; inserts++; return q; },
      update() { action = 'update'; updates++; return q; },
      select() { return q; }, eq() { return q; }, gte() { return q; }, limit() { return q; },
      single() { return Promise.resolve(result()); },
      then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); }
    };
    function result() {
      if (action === 'insert' && options.saveError) return { error: { message: 'Failed' } };
      if (action === 'insert' && options.existing) return { error: { code: '23505' } };
      if (action === 'insert') return { data: { id: 'saved' } };
      if (slug === 'newsletter-signup') return { data: { active: options.active } };
      return { data: options.recent ? [{ id: 'prior' }] : [] };
    }
    return q;
  } };
  vm.runInNewContext(source.slice(source.indexOf('serve(async')), {
    serve: fn => { handler = fn; }, Response, Date, console: { error() {} },
    Deno: { env: { get: () => 'mock' } }, createClient: () => client,
    json: (body, init) => new Response(JSON.stringify(body), init),
    sendArtistConfirmation: async () => { emails++; if (options.mailError) throw Error('Gmail failed'); }
  });
  return { counts: () => ({ emails, inserts, updates }), call: async () => {
    const response = await handler(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({
      name: 'Test Artist', email: 'test@example.invalid', phone: '4025550100', city: 'Omaha, NE', genre: 'Beats', pitch: 'Test'
    }) }));
    return { status: response.status, body: await response.json() };
  } };
}
test('active newsletter subscriber gets already-subscribed without an update or email', async () => {
  const app = setup('newsletter-signup', { existing: true, active: true });
  assert.equal((await app.call()).body.alreadySubscribed, true);
  assert.equal(app.counts().updates, 0);
  assert.equal(app.counts().emails, 0);
});
test('inactive newsletter subscriber can rejoin', async () => {
  const app = setup('newsletter-signup', { existing: true, active: false });
  assert.equal((await app.call()).body.alreadySubscribed, false);
  assert.equal(app.counts().updates, 1);
});
test('artist save sends a receipt email', async () => {
  const app = setup('artist-submit');
  assert.equal((await app.call()).body.confirmationEmail, 'sent');
  assert.equal(app.counts().emails, 1);
});
test('Gmail failure does not report a saved submission as failed', async () => {
  const app = setup('artist-submit', { mailError: true });
  const result = await app.call();
  assert.equal(result.status, 200);
  assert.equal(result.body.submissionId, 'saved');
  assert.equal(result.body.confirmationEmail, 'failed');
});
test('failed save sends no email', async () => {
  const app = setup('artist-submit', { saveError: true });
  assert.equal((await app.call()).status, 400);
  assert.equal(app.counts().emails, 0);
});
test('recent repeat submissions do not receive another receipt email', async () => {
  const app = setup('artist-submit', { recent: true });
  assert.equal((await app.call()).body.confirmationEmail, 'skipped');
  assert.equal(app.counts().emails, 0);
});
test('public scripts parse', () => {
  for (const match of fs.readFileSync('index.html', 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1]);
});
