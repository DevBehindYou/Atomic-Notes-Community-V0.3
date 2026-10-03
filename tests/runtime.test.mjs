import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { once } from 'node:events';
import { createServer as createHttpServer } from 'node:http';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

const SECRET = 'test-only-session-signing-secret'; // exactly 32 bytes
const FIRST = 'test-first-key';
const SECOND = 'test-second-key';
const COOKIE = 'acb_admin';
const DAY = 24 * 60 * 60 * 1000;

async function freePort() {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((done) => reservation.close(done));
  return port;
}

/** Starts the production Community server this test owns, with only the given environment. */
async function startCommunity(t, env = {}) {
  const port = await freePort();
  const server = spawn(process.execPath, [
    resolve('node_modules/next/dist/bin/next'), 'start',
    '--hostname', '127.0.0.1', '--port', String(port),
  ], {
    windowsHide: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ADMIN_PASSWORD: FIRST,
      ADMIN_PASSWORD_2: SECOND,
      SESSION_SECRET: SECRET,
      // Never contact a deployed backend from these tests.
      ATOMIC_SERVER_URL: '',
      ADMIN_API_KEY: '',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (chunk) => { output = (output + chunk).slice(-12000); });
  }
  const stopped = once(server, 'exit');
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) server.kill();
    await stopped;
  });
  const base = `http://127.0.0.1:${port}`;
  const request = (path, options = {}) => fetch(base + path, {
    redirect: 'manual', ...options, signal: AbortSignal.timeout(10000),
  });
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    try {
      ready = (await request('/api/controller/session')).ok;
      if (ready) break;
    } catch { /* Wait for the owned server to start. */ }
    await delay(250);
  }
  assert.ok(ready, `Production server did not become ready:\n${output}`);
  return { base, request };
}

const json = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const sign = (timestamp, secret = SECRET) => createHmac('sha256', secret).update(timestamp).digest('hex');
const validPassword = { password: FIRST, password2: SECOND };

async function adminCookie({ request }) {
  const response = await request('/api/controller/login', json(validPassword));
  assert.equal(response.status, 200);
  return { cookie: response.headers.get('set-cookie').split(';')[0] };
}

test('production routes preserve authentication and public content', { timeout: 90000 }, async (t) => {
  const { base, request } = await startCommunity(t);

  for (const path of ['/', '/support-atomic-notes', '/blog', '/updates', '/controller', '/api/controller/session']) {
    await t.test(`R23 content boundaries cover ${path}`, async () => {
      const response = await request(path);
      assert.equal(response.status, 200);
      const policy = response.headers.get('content-security-policy') ?? '';
      const directives = new Map(policy.split(';').filter((part) => part.trim()).map((part) => {
        const [name, ...values] = part.trim().split(/\s+/);
        return [name, values];
      }));
      assert.deepEqual(directives.get('default-src'), ["'self'"], path);
      assert.deepEqual(directives.get('object-src'), ["'none'"], path);
      assert.deepEqual(directives.get('base-uri'), ["'self'"], path);
      assert.deepEqual(directives.get('form-action'), ["'self'"], path);
      assert.deepEqual(directives.get('frame-ancestors'), ["'none'"], path);
      assert.deepEqual(directives.get('connect-src'), ["'self'"], path);
      assert.ok(directives.get('script-src')?.includes("'self'"), path);
      assert.ok(!directives.get('script-src')?.includes("'unsafe-eval'"), 'production does not allow eval');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff', path);
      assert.equal(response.headers.get('x-frame-options'), 'DENY', path);
    });
  }

  await t.test('every admin operation rejects an anonymous request', async () => {
    for (const [route, method] of [
      ['health', 'GET'], ['stats', 'GET'], ['user', 'GET'], ['energy', 'POST'], ['coins', 'GET'],
      ['notifications', 'GET'], ['notifications', 'POST'],
      ['notifications', 'PATCH'], ['notifications', 'DELETE'],
    ]) {
      const response = await request(`/api/controller/${route}`, { method });
      assert.equal(response.status, 401, `${method} ${route}`);
    }
  });

  await t.test('the admin surface cannot be framed, cached or indexed', async () => {
    for (const path of ['/controller', '/api/controller/session']) {
      const response = await request(path);
      assert.equal(response.headers.get('x-frame-options'), 'DENY', path);
      assert.match(response.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/, path);
      assert.match(response.headers.get('cache-control') ?? '', /no-store/, path);
      assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/, path);
    }
    assert.match(await (await request('/controller')).text(), /<title>Atomic Controller<\/title>/);
    const robots = await (await request('/robots.txt')).text();
    assert.equal(robots.includes('/controller'), false, 'robots.txt must not point at the panel');
    assert.match(robots, /Disallow: \/api\//);
  });

  await t.test('both passwords are required and signed cookies resolve to booleans', async () => {
    assert.deepEqual(await (await request('/api/controller/session')).json(), { admin: false });
    const login = (body) => request('/api/controller/login', json(body));
    for (const body of [
      { password: FIRST },
      { password: 'wrong', password2: SECOND },
    ]) assert.equal((await login(body)).status, 401);
    const response = await login(validPassword);
    assert.equal(response.status, 200);
    const setCookie = response.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/i);
    const headers = { cookie: setCookie.split(';')[0] };
    assert.deepEqual(await (await request('/api/controller/session', { headers })).json(), { admin: true });
    assert.equal((await request('/api/controller/health', { headers })).status, 200);
    assert.deepEqual(await (await request('/api/controller/session', {
      headers: { cookie: headers.cookie + 'tampered' },
    })).json(), { admin: false });
    const logout = await request('/api/controller/logout', { method: 'POST' });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get('set-cookie'), /Max-Age=0/i);
  });

  await t.test('wrong-typed and malformed login bodies are rejected as 401, never a server error', async () => {
    for (const body of [
      JSON.stringify({ password: 123, password2: SECOND }),
      JSON.stringify({ password: [FIRST], password2: {} }),
      JSON.stringify({ password: FIRST, password2: null }),
      JSON.stringify({ password: true, password2: false }),
      JSON.stringify(null), JSON.stringify([]), JSON.stringify('text'), '{', '',
    ]) {
      const response = await request('/api/controller/login', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body,
      });
      assert.equal(response.status, 401, `body ${body}`);
    }
  });

  await t.test('forged, malformed, future and expired session cookies are not admin', async () => {
    const session = async (value) => (await (await request('/api/controller/session', {
      headers: { cookie: `${COOKIE}=${value}` },
    })).json()).admin;
    const now = Date.now();
    const fresh = String(now);
    assert.equal(await session(`${fresh}.${sign(fresh)}`), true);
    assert.equal(await session(`${now - 6 * DAY}.${sign(String(now - 6 * DAY))}`), true);

    const future = String(now + 5 * 60 * 1000);
    assert.equal(await session(`${future}.${sign(future)}`), false, 'future timestamp');
    const expired = String(now - 8 * DAY);
    assert.equal(await session(`${expired}.${sign(expired)}`), false, 'expired');
    const justExpired = String(now - 7 * DAY - 1000);
    assert.equal(await session(`${justExpired}.${sign(justExpired)}`), false, 'just past seven days');

    assert.equal(await session(`${fresh}.${sign(fresh, 'another-secret-another-secret-0000')}`), false, 'wrong secret');
    assert.equal(await session(`${fresh}.${sign(fresh).slice(0, 63)}`), false, 'short signature');
    assert.equal(await session(`${fresh}.${sign(fresh).toUpperCase()}`), false, 'uppercase signature');
    assert.equal(await session(`${fresh}.${'0'.repeat(64)}`), false, 'zero signature');
    const short = String(now).slice(1);
    assert.equal(await session(`${short}.${sign(short)}`), false, 'malformed timestamp');
    assert.equal(await session(`${fresh}.${sign(fresh)}.extra`), false, 'extra segment');
    assert.equal(await session(''), false);
    assert.equal(await session(fresh), false, 'no signature');
  });

  await t.test('cross-origin controller mutations are rejected, reads and same-origin calls are not', async () => {
    const foreign = { origin: 'https://evil.example' };
    const post = (path, headers, body = validPassword) => request(path, {
      method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
    });
    assert.equal((await post('/api/controller/login', foreign)).status, 403);
    assert.equal((await post('/api/controller/logout', foreign)).status, 403);
    assert.equal((await post('/api/controller/login', { origin: 'null' })).status, 403);

    assert.equal((await post('/api/controller/login', { origin: base })).status, 200);
    assert.equal((await post('/api/controller/login', { origin: 'https://admin.example', 'x-forwarded-host': 'admin.example' })).status, 200, 'proxied host');
    assert.equal((await post('/api/controller/login', { origin: base.replace(/:\d+$/, ':1') })).status, 403, 'same hostname, different port');
    assert.equal((await post('/api/controller/login', { origin: 'not a url' })).status, 403);
    assert.equal((await post('/api/controller/login', {})).status, 200, 'requests without Origin (non-browser) stay allowed');

    // Even with a valid admin session, a foreign page cannot trigger an admin mutation.
    const { cookie } = await adminCookie({ request });
    for (const method of ['POST', 'PATCH', 'DELETE']) {
      const response = await request('/api/controller/notifications?id=x', {
        method, headers: { cookie, ...foreign, 'content-type': 'application/json' }, body: method === 'DELETE' ? undefined : '{}',
      });
      assert.equal(response.status, 403, method);
    }
    assert.equal((await request('/api/controller/energy', {
      method: 'POST', headers: { cookie, ...foreign, 'content-type': 'application/json' }, body: '{}',
    })).status, 403);
    assert.deepEqual(await (await request('/api/controller/session', { headers: { ...foreign } })).json(), { admin: false });
  });

  await t.test('static article, missing article and RSS feed remain available', async () => {
    const article = await request('/blog/atomic-notes-v1-18-2');
    assert.equal(article.status, 200);
    const html = await article.text();
    assert.match(html, /<title>[^<]*Atomic/i);
    assert.match(html, /rel="canonical" href="https:\/\/atomic-notes-community\.vercel\.app\/blog\/atomic-notes-v1-18-2"/);
    assert.equal((await request('/blog/nonexistent-smoke-test-article')).status, 404);
    const feed = await request('/feed.xml');
    assert.equal(feed.status, 200);
    const xml = await feed.text();
    assert.match(xml, /<rss[\s>]/);
    assert.match(xml, /https:\/\/atomic-notes-community\.vercel\.app\/blog\//);
    assert.equal(xml.includes('atomic-notes.vercel.app'), false);
    const sitemap = await (await request('/sitemap.xml')).text();
    assert.match(sitemap, /<loc>https:\/\/atomic-notes-community\.vercel\.app<\/loc>|<loc>https:\/\/atomic-notes-community\.vercel\.app\/<\/loc>/);
  });

  await t.test('download links point at the App repository, not a tag that may not exist', async () => {
    const home = await (await request('/')).text();
    // Unless NEXT_PUBLIC_APK_URL was set when the site was built, the button uses the default.
    const apkLink = /href="(https:\/\/github\.com\/DevBehindYou\/[^"]+\/releases\/latest)"/.exec(home);
    assert.ok(apkLink, 'a GitHub releases/latest download link');
    assert.equal(home.includes('ci-latest'), false);
    assert.equal(home.includes('Project-Atomic-Notes'), false, 'the old repository name is gone');
    assert.match(home, /href="https:\/\/github\.com\/DevBehindYou\/Atomic-Notes-App-V0\.2"/);
  });
});

test('controller login fails closed when its configuration is missing or weak', { timeout: 90000 }, async (t) => {
  await t.test('a session secret shorter than 32 bytes disables login and never validates cookies', async (t) => {
    const weak = 'short-secret';
    const { request } = await startCommunity(t, { SESSION_SECRET: weak });
    const refused = await request('/api/controller/login', json(validPassword));
    assert.equal(refused.status, 503);
    const body = await refused.json();
    assert.deepEqual(body.problems, ['SESSION_SECRET is shorter than 32 bytes']);
    assert.equal(JSON.stringify(body).includes(weak), false, 'names only, never a value');
    const stamp = String(Date.now());
    const forged = await request('/api/controller/session', { headers: { cookie: `${COOKIE}=${stamp}.${sign(stamp, weak)}` } });
    assert.deepEqual(await forged.json(), { admin: false });
  });

  await t.test('a missing session secret or second password disables login', async (t) => {
    for (const env of [{ SESSION_SECRET: '' }, { ADMIN_PASSWORD_2: '' }, { ADMIN_PASSWORD: '' }]) {
      await t.test(JSON.stringify(Object.keys(env)), async (t) => {
        const { request } = await startCommunity(t, env);
        assert.equal((await request('/api/controller/login', json(validPassword))).status, 503);
        assert.deepEqual(await (await request('/api/controller/session')).json(), { admin: false });
      });
    }
  });
});

/** A stand-in for the Atomic Notes Server's /api/admin/* and /api/public/* contract. */
async function startFakeServer(t, adminKey) {
  const seen = [];
  // Controller state the fake keeps: the session revocation time, and whether sign-in is locked.
  const state = { revokedBefore: null, locked: false, failEpoch: false, failRevoke: false, coinReplay: true };
  const notification = {
    id: '3f0a1c9e-6c1b-4a41-9a0f-6d2f0e7b1a11', type: 'maintenance', subject: 'Contract test subject', description: 'From the fake Server',
    priority: 'high', status: 'active', action: null, action_url: null, icon: null, target_audience: 'all',
    min_app_version: null, max_app_version: null, created_at: '2026-09-15T00:00:00.000Z', expires_at: null,
  };
  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url, 'http://fake');
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    seen.push({ method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), key: req.headers['x-admin-api-key'] ?? null,
      contentType: req.headers['content-type'] ?? null, body: raw ? JSON.parse(raw) : null });
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (url.pathname === '/api/public/notifications/active') return send(200, { rows: [notification] });
    if (req.headers['x-admin-api-key'] !== adminKey) return send(401, { error: 'unauthorized' });
    switch (`${req.method} ${url.pathname}`) {
      case 'GET /api/admin/health': return send(200, { coin_request_replay: state.coinReplay, db: true, dbError: null, configuration: [], time: 'now' });
      case 'GET /api/admin/stats': return send(200, { stats: { users: 3 } });
      case 'GET /api/admin/user': return send(200, { user_id: 'u1', email: url.searchParams.get('email'), coins: 5, energy: 20, energy_cap: 120 });
      case 'GET /api/admin/coins': return send(200, { enabled: true, rows: [], next_cursor: null });
      case 'POST /api/admin/energy': return send(200, { ok: true, user_id: 'u1', coins: 6, energy: 30 });
      case 'GET /api/admin/notifications': return send(200, { rows: [notification] });
      case 'POST /api/admin/notifications': return send(200, { row: { ...notification, id: 'created' }, audience_size: 7 });
      case 'PATCH /api/admin/notifications': return send(200, { row: { ...notification, status: 'resolved' } });
      case 'DELETE /api/admin/notifications': return send(200, { ok: true });
      case 'GET /api/admin/controller/session-epoch':
        if (state.failEpoch) return send(503, { error: 'epoch_unavailable' });
        return send(200, { revoked_before: state.revokedBefore });
      case 'POST /api/admin/controller/session-epoch':
        if (state.failRevoke) return send(503, { error: 'revocation_unavailable' });
        state.revokedBefore = Math.max(state.revokedBefore ?? 0, JSON.parse(raw).revoked_before);
        return send(200, { revoked_before: state.revokedBefore });
      case 'POST /api/admin/controller/login-attempts':
        return send(200, state.locked ? { allowed: false, retry_after_seconds: 600 } : { allowed: true, retry_after_seconds: 0 });
      default: return send(404, { error: 'not_found' });
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((done) => { server.close(done); server.closeAllConnections(); }));
  return { url: `http://127.0.0.1:${server.address().port}`, seen, state };
}

test('Community calls the Server admin and public contract exactly as the Server defines it', { timeout: 120000 }, async (t) => {
  const KEY = 'contract-test-admin-key-0123456789abcdef';
  const fake = await startFakeServer(t, KEY);
  const community = await startCommunity(t, { ATOMIC_SERVER_URL: fake.url + '/', ADMIN_API_KEY: KEY });
  const { request } = community;
  const headers = await adminCookie(community);
  const post = (path, body, method = 'POST') => request(path, { method, headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const last = () => fake.seen[fake.seen.length - 1];

  await t.test('reads and mutations reach the right Server route with the shared key', async () => {
    const health = await (await request('/api/controller/health', { headers })).json();
    assert.deepEqual([health.db, health.dbError], [true, null]);
    assert.deepEqual(last(), { ...last(), method: 'GET', path: '/api/admin/health', key: KEY });
    assert.equal(JSON.stringify(health).includes(KEY), false, 'the admin key must never reach the browser');
    // apk_url is NEXT_PUBLIC_APK_URL, fixed at build time from whatever .env the build saw, so only its type is stable here.
    assert.deepEqual(health.env, { atomic_server_url: true, admin_api_key: true, admin_password: true, admin_password_2: true, session_secret: true, apk_url: health.env.apk_url });
    assert.equal(typeof health.env.apk_url, 'boolean');

    assert.deepEqual(await (await request('/api/controller/stats', { headers })).json(), { stats: { users: 3 } });
    assert.equal(last().path, '/api/admin/stats');

    const user = await (await request('/api/controller/user?email=a%2Bb%40example.com', { headers })).json();
    assert.equal(user.email, 'a+b@example.com');
    assert.deepEqual([last().path, last().query.email], ['/api/admin/user', 'a+b@example.com']);

    const batches = await request('/api/controller/coins?user_id=u1&cursor=opaque%2Bcursor', { headers });
    assert.equal(batches.status, 200);
    assert.deepEqual([last().path, last().query], ['/api/admin/coins', { user_id: 'u1', cursor: 'opaque+cursor' }]);

    const energy = await post('/api/controller/energy', { email: 'a@example.com', coins_delta: '1', energy_delta: 10, note: 'test', request_id: '5c4f1ecc-0a9a-4f86-825b-5fdd7870e310' });
    assert.equal(energy.status, 200);
    assert.deepEqual(last().body, { email: 'a@example.com', coins_delta: 1, energy_delta: 10, note: 'test', request_id: '5c4f1ecc-0a9a-4f86-825b-5fdd7870e310' });
    assert.equal(last().contentType, 'application/json');

    assert.equal((await request('/api/controller/notifications', { headers })).status, 200);
    assert.deepEqual([last().method, last().path], ['GET', '/api/admin/notifications']);
    const created = { type: 'maintenance', subject: 's', description: 'd' };
    const published = await post('/api/controller/notifications', created);
    assert.equal(published.status, 200);
    assert.equal((await published.json()).audience_size, 7, 'how many users it reached is passed on');
    assert.deepEqual([last().method, last().body], ['POST', created]);
    assert.equal((await post('/api/controller/notifications', { id: 'n1', status: 'resolved' }, 'PATCH')).status, 200);
    assert.deepEqual([last().method, last().body.id], ['PATCH', 'n1']);
    assert.equal((await request('/api/controller/notifications?id=a%20b', { method: 'DELETE', headers })).status, 200);
    assert.deepEqual([last().method, last().query.id], ['DELETE', 'a b']);
    assert.ok(fake.seen.filter((call) => call.path.startsWith('/api/admin/')).every((call) => call.key === KEY));
  });

  await t.test('older Servers and missing request IDs cannot receive unsafe coin adjustments', async () => {
    const count = () => fake.seen.filter((call) => call.path === '/api/admin/energy').length;
    const before = count();
    assert.equal((await post('/api/controller/energy', { user_id: 'u1', coins_delta: 1 })).status, 400);
    fake.state.coinReplay = false;
    try {
      assert.equal((await post('/api/controller/energy', { user_id: 'u1', coins_delta: 1, request_id: '5c4f1ecc-0a9a-4f86-825b-5fdd7870e310' })).status, 409);
      assert.equal(count(), before);
    } finally { fake.state.coinReplay = true; }
  });

  await t.test('invalid controller input never reaches the Server', async () => {
    // The session check may read the revocation time; nothing else may go out.
    const counted = () => fake.seen.filter((call) => !call.path.endsWith('/controller/session-epoch')).length;
    const before = counted();
    assert.equal((await request('/api/controller/user', { headers })).status, 400);
    assert.equal((await post('/api/controller/energy', { coins_delta: 1 })).status, 400);
    assert.equal((await post('/api/controller/notifications', { type: 'x' })).status, 400);
    assert.equal((await post('/api/controller/notifications', { subject: 'x' }, 'PATCH')).status, 400);
    assert.equal((await request('/api/controller/notifications', { method: 'DELETE', headers })).status, 400);
    assert.equal(counted(), before);
  });

  await t.test('public pages render notifications fetched from the Server without an admin key', async () => {
    const before = fake.seen.length;
    for (const path of ['/', '/updates']) {
      const html = await (await request(path)).text();
      assert.match(html, /Contract test subject/, path);
    }
    const calls = fake.seen.slice(before);
    assert.ok(calls.length >= 2);
    assert.ok(calls.every((call) => call.path === '/api/public/notifications/active' && call.key === null));
  });

  await t.test('sign-in is throttled through the Server, per client', async () => {
    const attempts = () => fake.seen.filter((call) => call.path === '/api/admin/controller/login-attempts').map((call) => call.body.result);
    fake.state.locked = true;
    const locked = await request('/api/controller/login', json(validPassword));
    assert.equal(locked.status, 429, 'even the right keys wait out a lockout');
    assert.match((await locked.json()).error, /Try again in 10 min/);
    assert.equal(locked.headers.get('retry-after'), '600');
    fake.state.locked = false;
    const before = attempts().length;
    assert.equal((await request('/api/controller/login', json({ password: 'wrong', password2: SECOND }))).status, 401);
    assert.equal((await request('/api/controller/login', json(validPassword))).status, 200);
    assert.deepEqual(attempts().slice(before), ['check', 'failure', 'check', 'success']);
    assert.ok(fake.seen.filter((call) => call.path === '/api/admin/controller/login-attempts').every((call) => typeof call.body.client === 'string'));
  });

  await t.test('log out everywhere ends a copied session cookie too', async () => {
    const mine = await adminCookie({ request });
    const copied = { cookie: mine.cookie };
    assert.equal((await request('/api/controller/stats', { headers: copied })).status, 200);
    const out = await request('/api/controller/logout', { method: 'POST', headers: mine });
    assert.deepEqual(await out.json(), { ok: true, revoked: true });
    assert.ok(Math.abs(fake.state.revokedBefore - Date.now()) < 10000);
    assert.equal((await request('/api/controller/stats', { headers: copied })).status, 401);
    assert.deepEqual(await (await request('/api/controller/session', { headers: copied })).json(), { admin: false });
    // Signing in again works; an anonymous logout revokes nothing.
    await delay(5);
    const again = await adminCookie({ request });
    assert.equal((await request('/api/controller/stats', { headers: again })).status, 200);
    const revokedBefore = fake.state.revokedBefore;
    assert.deepEqual(await (await request('/api/controller/logout', { method: 'POST' })).json(), { ok: true, revoked: false });
    assert.equal(fake.state.revokedBefore, revokedBefore);
  });

  await t.test('a Server rejection or outage is reported as a controller error, not success', async (t) => {
    // Sign-in needs the Server (its throttle), so a refused key or an outage stops it and says which.
    const wrongKey = await startCommunity(t, { ATOMIC_SERVER_URL: fake.url, ADMIN_API_KEY: 'a-different-key-a-different-key-000' });
    const refused = await wrongKey.request('/api/controller/login', json(validPassword));
    assert.equal(refused.status, 503);
    assert.match((await refused.json()).error, /refused this Controller's ADMIN_API_KEY/);

    const down = await startCommunity(t, { ATOMIC_SERVER_URL: `http://127.0.0.1:${await freePort()}`, ADMIN_API_KEY: KEY });
    const unreachable = await down.request('/api/controller/login', json(validPassword));
    assert.equal(unreachable.status, 503);
    assert.match((await unreachable.json()).error, /Could not reach/);
    // A session made while the Server was up still gets only errors, never success, during an outage.
    const stamp = String(Date.now());
    const cookie = { cookie: `${COOKIE}=${stamp}.${sign(stamp)}` };
    assert.equal((await down.request('/api/controller/stats', { headers: cookie })).status, 401);
    assert.equal((await down.request('/updates')).status, 200, 'the public page degrades instead of failing');
  });
});


test('revocation lookup failure cannot authorize a copied cookie', { timeout: 30000 }, async (t) => {
  const KEY = 'isolated-revocation-test-key-000000';
  const fake = await startFakeServer(t, KEY);
  fake.state.revokedBefore = Date.now();
  fake.state.failEpoch = true;
  const { request } = await startCommunity(t, { ATOMIC_SERVER_URL: fake.url, ADMIN_API_KEY: KEY });
  const stamp = String(Date.now() - 1000);
  const headers = { cookie: `${COOKIE}=${stamp}.${sign(stamp)}` };
  const result = await request('/api/controller/stats', { headers });
  assert.equal(result.status, 401);
  assert.equal(fake.seen.some((call) => call.path === '/api/admin/stats'), false,
    'protected request must stop before the reachable downstream admin route');
});

test('expired revocation cache cannot authorize during an epoch outage', { timeout: 30000 }, async (t) => {
  const KEY = 'isolated-epoch-cache-test-key-00000';
  const fake = await startFakeServer(t, KEY);
  const { request } = await startCommunity(t, { ATOMIC_SERVER_URL: fake.url, ADMIN_API_KEY: KEY });
  const headers = await adminCookie({ request });
  assert.equal((await request('/api/controller/stats', { headers })).status, 200);
  fake.state.revokedBefore = Date.now();
  fake.state.failEpoch = true;
  await delay(5100);
  const calls = fake.seen.filter((call) => call.path === '/api/admin/stats').length;
  assert.equal((await request('/api/controller/stats', { headers })).status, 401);
  assert.equal(fake.seen.filter((call) => call.path === '/api/admin/stats').length, calls);
  fake.state.failEpoch = false;
  assert.equal((await request('/api/controller/stats', { headers })).status, 401,
    'recovery must observe the revocation, not restore the stale cache');
});

test('failed global logout explicitly reports only local cookie removal', { timeout: 30000 }, async (t) => {
  const KEY = 'isolated-revoke-failure-test-key-00';
  const fake = await startFakeServer(t, KEY);
  const { request } = await startCommunity(t, { ATOMIC_SERVER_URL: fake.url, ADMIN_API_KEY: KEY });
  const headers = await adminCookie({ request });
  fake.state.failRevoke = true;
  const response = await request('/api/controller/logout', { method: 'POST', headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, revoked: false });
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
  assert.equal(fake.state.revokedBefore, null);
});
