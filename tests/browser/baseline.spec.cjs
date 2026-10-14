const { test, expect } = require('@playwright/test');

async function isolate(page, loggedIn = false) {
  const user = { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.invalid', app_metadata: { is_admin: true }, user_metadata: {}, aud: 'authenticated', role: 'authenticated' };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const session = { access_token: `${encode({alg:'HS256',typ:'JWT'})}.${encode({...user,sub:user.id,exp})}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user };
  if (loggedIn) await page.addInitScript(session => localStorage.setItem('sb-dafqbhphoeblxpfrizwx-auth-token', JSON.stringify(session)), session);
  const tables = {
    site_copy: [{ id: 1, name: 'SOUND.WAV TEST', eyebrow: 'Saved eyebrow' }],
    upcoming_show: [{ id: 1, title: 'Fixture show', show_date: '2027-01-10', venue: 'Fixture venue', description: 'Saved show', banner_path: '' }],
    newsletters: [
      { id: '11111111-1111-4111-8111-111111111112', subject: 'Current fixture', body: 'Current body', is_current: true, sent_at: '2026-01-01', created_at: '2026-01-01', broadcast_locked_at: null },
      { id: '11111111-1111-4111-8111-111111111113', subject: 'Older fixture', body: 'Older body', is_current: false, sent_at: null, created_at: '2025-01-01', broadcast_locked_at: '2026-01-01' }
    ],
    artists: [], artist_images: [], shows: [], show_artists: [], show_media: [], affiliates: [], donation_methods: [],
    subscribers: [], artist_submissions: [], upcoming_show_artists: [],
    upcoming_drafts: [{ id: '11111111-1111-4111-8111-111111111114', title: 'Draft fixture', show_date: '2027-01-10', venue: 'Fixture venue', address: '123 Test St', description: 'Draft description', banner_path: '', is_current: false }], upcoming_draft_artists: []
  };
  const requests = [];
  await page.route('**/*.supabase.co/**', async route => {
    const request = route.request(), url = new URL(request.url());
    requests.push({ path: url.pathname, method: request.method() });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    const reply = json => route.fulfill({ json, headers: { 'Access-Control-Allow-Origin': '*' } });
    if (url.pathname.includes('/auth/v1/token')) return reply(session);
    if (url.pathname.includes('/auth/v1/user')) return reply(user);
    if (url.pathname.includes('/auth/v1/logout')) return reply({});
    if (!url.pathname.includes('/rest/v1/')) return route.fulfill({status: 400, json:{error:'Unmocked endpoint blocked'}});
    const table = url.pathname.split('/').pop();
    let rows = tables[table] || [];
    for (const [key, filter] of url.searchParams) {
      if (filter.startsWith('eq.')) rows = rows.filter(row => String(row[key]) === filter.slice(3));
      if (filter.startsWith('neq.')) rows = rows.filter(row => String(row[key]) !== filter.slice(4));
    }
    if (request.method() === 'PATCH') rows.forEach(row => Object.assign(row, request.postDataJSON()));
    if (request.method() === 'DELETE') tables[table] = (tables[table] || []).filter(row => !rows.includes(row));
    if (request.method() === 'POST') {
      const data = request.postDataJSON();
      rows = Array.isArray(data) ? data : [data];
      const existing = tables[table] || [];
      for (const row of rows) {
        const match = existing.find(item => item.id === row.id);
        if (match) Object.assign(match, row); else existing.push(row);
      }
      tables[table] = existing;
    }
    return reply(request.headers().accept?.includes('vnd.pgrst.object') ? (rows[0] || null) : rows);
  });
  return { tables, requests };
}

test('public shows authoritative content without opening admin', async ({page}) => {
  await isolate(page);
  await page.goto('/');
  await expect(page.locator('body')).not.toHaveClass(/public-loading/);
  await expect(page.locator('#brand-name')).toHaveText('SOUND.WAV TEST');
  await expect(page.locator('#latest-newsletter-subject')).toHaveText('Current fixture');
  await expect(page.locator('#owner-shell')).toBeHidden();
});

test('login and single-click logout', async ({page}) => {
  await isolate(page);
  await page.goto('/admin.html');
  await page.locator('#login-form [name=email]').fill('admin@example.invalid');
  await page.locator('#login-form [name=password]').fill('fixture-password');
  await page.locator('#login-button').click();
  await expect(page.locator('#owner-dashboard')).toBeVisible();
  await page.locator('#logout-button').click();
  await expect(page).toHaveURL(/index\.html$/);
  await expect(page.locator('#public-shell')).toBeVisible();
  await expect(page.locator('#owner-dashboard')).toBeHidden();
});

test('newsletter lock/unlock and current selection remain independent', async ({page}) => {
  const {tables,requests} = await isolate(page, true);
  await page.goto('/admin.html');
  await page.locator('[data-owner-view=newsletter]').click();
  const current = page.locator('#campaign-log article').filter({hasText:'Current fixture'});
  await current.getByRole('button',{name:'Lock broadcast',exact:true}).click();
  await expect(current.getByRole('button',{name:'Unlock broadcast',exact:true})).toBeVisible();
  await current.getByRole('button',{name:'Unlock broadcast',exact:true}).click();
  await expect(current.getByRole('button',{name:'Broadcast',exact:true})).toBeVisible();
  const older = page.locator('#campaign-log article').filter({hasText:'Older fixture'});
  await older.getByRole('button',{name:'Set current',exact:true}).click();
  await expect(older.locator('.current-tag').filter({hasText:'Current'})).toBeVisible();
  expect(tables.newsletters[1].is_current).toBe(true);
  expect(tables.newsletters[1].broadcast_locked_at).not.toBeNull();
  expect(requests.filter(r=>r.path.includes('/functions/'))).toHaveLength(0);
});

test('newsletter edit/save persists and remains visible', async ({page}) => {
  const {tables} = await isolate(page, true);
  await page.goto('/admin.html');
  await page.locator('[data-owner-view=newsletter]').click();
  const row = page.locator('#campaign-log article').filter({hasText:'Current fixture'});
  await row.getByRole('button',{name:'Edit',exact:true}).click();
  await page.locator('[data-newsletter-subject]').fill('Updated fixture');
  await page.locator('[data-save-newsletter-id]').click();
  await expect(page.locator('#campaign-log')).toContainText('Updated fixture');
  expect(tables.newsletters[0].subject).toBe('Updated fixture');
});

test('upcoming show edit/save and selected image preview', async ({page}) => {
  const {tables} = await isolate(page, true);
  await page.goto('/admin.html');
  await page.locator('[data-owner-view=upcoming]').click();
  await page.locator('[data-final-edit-id]').click();
  await page.locator('[data-inline-title]').fill('Edited draft fixture');
  await page.locator('[data-inline-save-upcoming=draft]').click();
  await expect(page.locator('#upcoming-draft-list')).toContainText('Edited draft fixture');
  await expect.poll(() => tables.upcoming_drafts[0].title).toBe('Edited draft fixture');
  await page.locator('[data-final-edit-id]').click();
  await page.locator('[data-inline-banner]').setInputFiles({name:'preview.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
  await expect(page.locator('[data-upcoming-inline-mode] img').first()).toBeVisible();
});

test('deleting the last newsletter cannot restore stale cached newsletters', async ({page}) => {
  const {tables} = await isolate(page, true);
  await page.goto('/admin.html');
  await page.locator('[data-owner-view=newsletter]').click();
  await page.locator('#campaign-log article').filter({hasText:'Older fixture'}).getByRole('button',{name:'Delete',exact:true}).click();
  await expect.poll(()=>tables.newsletters.length).toBe(1);
  await page.locator('#campaign-log article').filter({hasText:'Current fixture'}).getByRole('button',{name:'Delete',exact:true}).click();
  await expect.poll(()=>tables.newsletters.length).toBe(0);
  await expect(page.locator('#campaign-log')).toHaveText('No newsletters saved yet.');
  await page.reload();
  await page.locator('[data-owner-view=newsletter]').click();
  await expect(page.locator('#campaign-log')).toHaveText('No newsletters saved yet.');
});
