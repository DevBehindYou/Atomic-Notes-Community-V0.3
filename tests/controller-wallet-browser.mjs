import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Actual built Next/React UI, an owned Chrome profile and synthetic loopback API.
// No package installation, production credentials, database or deployed service.
const CASES = ['browser_setup', 'input_retires_account', 'reverse_lookup',
  'stale_failure_completion', 'same_owner_page_generation', 'same_owner_refresh_generation',
  'unmount_retires_read', 'settled_adjustment_input_change', 'ambiguous_adjustment_unmount',
  'current_page_deduplication', 'settled_adjustment_preserves_other_pending', 'cleanup'];
const cases = Object.fromEntries(CASES.map((name) => [name, 'not_run']));
const CSP_CASES = ['browser_setup', 'document_headers', 'spoofed_request_headers',
  'dom_script_block_and_authorize', 'fresh_document_nonce', 'native_login_logout',
  'public_document_navigation', 'public_headers_static_blog', 'api_origin_boundary', 'cleanup'];
const cspCases = Object.fromEntries(CSP_CASES.map((name) => [name, 'not_run']));
const proofFile = process.argv[2] ?? 'ci-controller-wallet-browser-proof.json';
assert.equal(basename(proofFile), proofFile, 'proof filename must stay in the checkout');
assert.match(proofFile, /^[A-Za-z0-9_.-]+\.json$/);
const cspProofFile = process.argv[3] ?? 'ci-controller-csp-proof.json';
assert.equal(basename(cspProofFile), cspProofFile);
assert.match(cspProofFile, /^[A-Za-z0-9_.-]+\.json$/);
assert.notEqual(cspProofFile, proofFile);
const sourceHead = /^[a-f0-9]{40}$/.test(process.env.ATOMIC_CONTROLLER_SOURCE_HEAD ?? '') ? process.env.ATOMIC_CONTROLLER_SOURCE_HEAD : null;
const children = [];
let ownedTemp, backend, backendBase, communityBase, cdp;
const FIRST = 'wallet-fixture-first-key', SECOND = 'wallet-fixture-second-key';
const A = 'wallet-a@example.test', B = 'wallet-b@example.test';
const ids = { [A]: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', [B]: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' };
let energyRequests = [], committed = new Set(), creditCount = 0, caseStop = Infinity;
const gates = [];
let fixtureError = false;
let domProbePhase = 'not_run';

async function bounded(promise, ms = 7000) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('bounded_fixture_timeout')), ms);
  })]); } finally { clearTimeout(timer); }
}
async function waitFor(predicate, ms = 7000) {
  const stop = Math.min(Date.now() + ms, caseStop);
  while (Date.now() < stop) { try { if (await predicate()) return; } catch { /* context may change during navigation */ } await delay(30); }
  throw new Error('bounded_fixture_timeout');
}
function user(email, coins = 50, rows = [batch('base-first')], cursor = 'fixture-page-one') {
  return { user_id: ids[email], email, username: null, email_confirmed: true,
    last_sign_in_at: null, auth_created_at: '2026-10-01T00:00:00.000Z', has_wallet: true,
    coins, energy: 20, energy_cap: 120, last_daily_grant_at: null,
    coin_details: details(rows, cursor) };
}
function batch(source) { return { id: source, source, amount: 10, remaining: 10,
  credited_at: '2026-10-01T00:00:00.000Z', expires_at: '2027-04-01T00:00:00.000Z' }; }
function details(rows, cursor) { return { enabled: true, non_expiring_coins: 0,
  next_expiry_coins: 10, next_expiry_at: '2027-04-01T00:00:00.000Z',
  next_cursor: cursor, server_time: '2026-10-12T00:00:00.000Z', rows }; }
function hold(kind, email) {
  const gate = { kind, email, seen: false, closed: false, resolved: false };
  gate.promise = new Promise((done) => { gate.done = done; });
  gate.release = (status, body) => { if (!gate.resolved) { gate.resolved = true; gate.done({ status, body }); } };
  gates.push(gate); return gate;
}
async function gated(kind, email, response, fallback) {
  const gate = gates.find((candidate) => !candidate.seen && candidate.kind === kind && candidate.email === email);
  if (!gate) return fallback;
  gate.seen = true;
  response.once('close', () => { gate.closed = true; gate.release(499, { error: 'fixture_closed' }); });
  return gate.promise;
}
function ownedChild(command, args, env = {}) {
  const child = spawn(command, args, { cwd: process.cwd(), windowsHide: true,
    detached: process.platform !== 'win32', env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  // Bounded private diagnostic capture. Never written, printed or uploaded.
  let privateOutput = '';
  for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => {
    privateOutput = (privateOutput + data.toString('utf8')).slice(-16384);
  });
  const stopped = new Promise((done) => { child.once('exit', done); child.once('error', done); });
  children.push({ child, stopped, discard: () => { privateOutput = ''; } });
  return child;
}
async function startBackend() {
  backend = createServer(async (request, response) => {
    const send = (status, body) => { if (!response.destroyed && !response.writableEnded) {
      response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(body));
    } };
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      const chunks = []; let bytes = 0;
      for await (const chunk of request) { bytes += chunk.length; if (bytes > 8192) throw new Error('fixture_body_limit'); chunks.push(chunk); }
      const raw = Buffer.concat(chunks).toString('utf8');
      const route = url.pathname;
      if (route === '/api/public/notifications/active') return send(200, { rows: [{
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', type: 'general', subject: 'Generated public fixture notice',
        description: 'Local fixture only', priority: 'normal', status: 'active', action: null,
        action_url: null, icon: null, target_audience: 'all', min_app_version: null,
        max_app_version: null, created_at: '2026-10-12T00:00:00.000Z', expires_at: null }] });
      if (route.endsWith('/controller/session-epoch') && request.method === 'POST') {
        const body = JSON.parse(raw); assert.ok(Number.isSafeInteger(body.revoked_before));
        return send(200, { revoked_before: body.revoked_before });
      }
      if (route.endsWith('/controller/session-epoch')) return send(200, { revoked_before: null });
      if (route.endsWith('/controller/login-attempts')) return send(200, { allowed: true, retry_after_seconds: 0 });
      if (request.headers['x-admin-api-key'] !== 'wallet-fixture-admin-key') return send(401, { error: 'fixture_unauthorized' });
      if (route.endsWith('/health')) return send(200, { coin_request_replay: true, db: true, dbError: null, configuration: [], time: 'fixture' });
      if (route.endsWith('/stats')) return send(200, { stats: { total_users: 2, active_24h: 0, new_7d: 0,
        total_notes: 0, vaults: 0, coins_circulating: 0, energy_outstanding: 0,
        active_notifications: 0, tx_24h: 0, coins_granted_24h: 0, energy_spent_24h: 0, ledger_by_kind: {} } });
      if (route.endsWith('/notifications')) return send(200, { rows: [], next_cursor: null });
      if (route.endsWith('/user')) {
        const email = url.searchParams.get('email'); assert.ok(ids[email]);
        const result = await gated('user', email, response, { status: 200, body: user(email) });
        return send(result.status, result.body);
      }
      if (route.endsWith('/coins')) {
        const id = url.searchParams.get('user_id'); const email = Object.keys(ids).find((key) => ids[key] === id); assert.ok(email);
        const result = await gated('page', email, response, { status: 200,
          body: details([batch('base-first'), batch('page-second')], null) });
        return send(result.status, result.body);
      }
      if (route.endsWith('/energy') && request.method === 'POST') {
        const payload = JSON.parse(raw); assert.ok(Object.values(ids).includes(payload.user_id));
        assert.match(payload.request_id, /^[a-f0-9-]{36}$/); energyRequests.push(payload);
        if (!committed.has(payload.request_id)) { committed.add(payload.request_id); creditCount++; }
        const email = Object.keys(ids).find((key) => ids[key] === payload.user_id);
        const result = await gated('energy', email, response, { status: 200,
          body: { ok: true, user_id: payload.user_id, coins: 51, energy: 20 } });
        return send(result.status, result.body);
      }
      send(404, { error: 'fixture_not_found' });
    } catch { fixtureError = true; send(500, { error: 'fixture_contract_failure' }); }
  });
  backend.listen(0, '127.0.0.1'); await once(backend, 'listening');
  backendBase = `http://127.0.0.1:${backend.address().port}`;
}

class CDP {
  constructor(socket) {
    this.socket = socket; this.id = 0; this.pending = new Map();
    this.energyRequests = new Set(); this.finishedEnergyRequests = new Set();
    socket.addEventListener('message', (event) => {
      let message; try { message = JSON.parse(event.data); } catch { return; }
      if (message.method === 'Network.requestWillBeSent') {
        const { request, requestId } = message.params;
        if (request.method === 'POST' && request.url === communityBase + '/api/controller/energy') {
          this.energyRequests.add(requestId);
        }
      }
      if (message.method === 'Network.loadingFinished' && this.energyRequests.has(message.params.requestId)) {
        this.finishedEnergyRequests.add(message.params.requestId);
      }
      if (message.id) { const entry = this.pending.get(message.id); if (!entry) return;
        this.pending.delete(message.id); clearTimeout(entry.timer);
        message.error ? entry.reject(new Error('cdp_command_failed')) : entry.resolve(message.result);
      }
    });
    socket.addEventListener('close', () => { for (const entry of this.pending.values()) {
      clearTimeout(entry.timer); entry.reject(new Error('cdp_closed')); } this.pending.clear(); });
  }
  call(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolveCall, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('cdp_timeout')); }, 7000);
      this.pending.set(id, { resolve: resolveCall, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error('browser_evaluation_failed');
    return result.result.value;
  }
}
async function startBrowser() {
  assert.equal(process.platform, 'linux', 'CI Chrome fixture is Linux only');
  const names = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  let chrome;
  for (const name of names) { try { await access(name); chrome = name; break; } catch { /* fixed candidate inventory */ } }
  assert.ok(chrome, 'preinstalled browser required; never install');
  const profile = join(ownedTemp, 'chrome-profile');
  ownedChild(chrome, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run',
    '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--proxy-server=http://127.0.0.1:1',
    '--proxy-bypass-list=127.0.0.1;localhost', 'about:blank']);
  let port;
  await waitFor(async () => { try { const text = await readFile(join(profile, 'DevToolsActivePort'), 'utf8');
    port = Number(text.split('\n')[0]); return Number.isInteger(port) && port > 0 && port < 65536; } catch { return false; } }, 20000);
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(5000) })).json();
  assert.equal(new URL(target.webSocketDebuggerUrl).hostname, '127.0.0.1');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await bounded(new Promise((done, reject) => { socket.addEventListener('open', done, { once: true }); socket.addEventListener('error', reject, { once: true }); }));
  cdp = new CDP(socket); await cdp.call('Page.enable'); await cdp.call('Runtime.enable'); await cdp.call('Network.enable');
  await cdp.call('Page.addScriptToEvaluateOnNewDocument', { source: 'window.confirm=()=>true;' });
}
// All DOM interactions execute on the actual Next-rendered Controller; no hook mock.
const uiPrelude = `const w=document.querySelector('[data-testid="wallet-email"]')?.closest('section')||[...document.querySelectorAll('section')].find(s=>s.textContent.includes('USER LOOKUP'));
const email=w?.querySelector('[data-testid="wallet-email"]')||w?.querySelector('input[placeholder="Search user by email"]');
const button=(text)=>[...w.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
const setInput=(input,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));};`;
const evaluateUI = (body) => cdp.evaluate(`(()=>{${uiPrelude}${body}})()`);
async function emailInput(value, enter = false) {
  await evaluateUI(`if(!email)throw Error('missing');setInput(email,${JSON.stringify(value)});`);
  await delay(40);
  if (enter) await evaluateUI(`email.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));`);
}
async function click(text) { await evaluateUI(`const b=button(${JSON.stringify(text)});if(!b||b.disabled)throw Error('missing_or_disabled');b.click();`); await delay(40); }
async function snapshot() {
  return evaluateUI(`const lookup=w?.querySelector('[data-testid="wallet-lookup"]')||button('Look up')||button('…');
const apply=w?.querySelector('[data-testid="wallet-apply"]')||button('Apply adjustment')||button('Applying…');
const detail=[...w.querySelectorAll('.mono')].find(n=>/wallet-[ab]@example\\.test/.test(n.textContent));
return {text:w?.textContent||'',found:detail?.textContent.trim()||'',lookupDisabled:!!lookup?.disabled,
applyEnabled:!!apply&&!apply.disabled,body:document.body.textContent,
pending:localStorage.getItem('atomic-controller-pending-adjustment-v1')};`);
}
async function assertFound(email, coins) {
  await waitFor(async () => (await snapshot()).found.includes(email));
  const value = await snapshot(); assert.ok(value.found.includes(email));
  if (coins !== undefined) assert.ok(await evaluateUI(`return [...w.querySelectorAll('.kpis>div')].some(d=>d.querySelector('.num')?.textContent==='COINS'&&d.querySelector('.stat')?.textContent.trim()===${JSON.stringify(String(coins))});`));
}
async function readyEconomy() {
  await waitFor(() => cdp.evaluate(`Boolean([...document.querySelectorAll('.tabs button')].find(b=>b.textContent==='economy'))`));
  await cdp.evaluate(`document.querySelectorAll('.tabs button')[2].click()`);
  await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[placeholder="Search user by email"]'))`));
}
async function resetUI() {
  for (const gate of gates) gate.release(503, { error: 'fixture_retired' });
  gates.length = 0; energyRequests = []; committed = new Set(); creditCount = 0; fixtureError = false;
  await cdp.evaluate(`window.__atomicFixtureNavigationMarker=true`);
  await cdp.call('Page.navigate', { url: communityBase + '/controller' });
  await waitFor(() => cdp.evaluate(`!window.__atomicFixtureNavigationMarker&&document.readyState==='complete'&&Boolean(document.querySelector('main'))`));
  await cdp.evaluate(`localStorage.removeItem('atomic-controller-pending-adjustment-v1')`);
  const loggedIn = await cdp.evaluate(`(async()=>{const r=await fetch('/api/controller/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:${JSON.stringify(FIRST)},password2:${JSON.stringify(SECOND)}})});return r.ok})()`);
  assert.ok(loggedIn);
  await cdp.evaluate(`window.__atomicFixtureNavigationMarker=true`);
  await cdp.call('Page.reload');
  await waitFor(() => cdp.evaluate(`!window.__atomicFixtureNavigationMarker&&document.readyState==='complete'`));
  await readyEconomy();
}
async function initialA(coins = 50, rows, cursor) {
  const gate = hold('user', A); await emailInput(A, true); await waitFor(() => gate.seen);
  gate.release(200, user(A, coins, rows, cursor)); await assertFound(A, coins);
}
async function applyOne() {
  await evaluateUI(`const input=w.querySelector('[data-testid="wallet-coins"]')||[...w.querySelectorAll('label')].find(n=>n.textContent.includes('Coins delta')).querySelector('input');setInput(input,'1');`);
  await delay(40); await click('Apply adjustment');
}
async function runCase(name, body) {
  caseStop = Date.now() + 30000;
  try { await resetUI(); await body(); assert.ok(Date.now() < caseStop); assert.equal(fixtureError, false); cases[name] = 'pass'; }
  catch { cases[name] = 'fail'; }
  finally { caseStop = Infinity; for (const gate of gates) gate.release(503, { error: 'fixture_retired' }); }
}
async function runCspCase(name, body) {
  caseStop = Date.now() + 30000;
  try { await resetUI(); await body(); assert.ok(Date.now() < caseStop); assert.equal(fixtureError, false); cspCases[name] = 'pass'; }
  catch { cspCases[name] = 'fail'; }
  finally { caseStop = Infinity; for (const gate of gates) gate.release(503, { error: 'fixture_retired' }); }
}
function policyOf(response) {
  const raw = response.headers.get('content-security-policy') ?? '';
  // Duplicate/combined header ownership must not silently weaken the result.
  assert.equal(raw.includes(','), false);
  const parts = raw.split(';').map((part) => part.trim()).filter(Boolean);
  const directives = new Map(parts.map((part) => { const [name, ...values] = part.split(/\s+/); return [name, values]; }));
  assert.equal(parts.length, directives.size);
  return directives;
}
function controllerPolicy(response) {
  assert.equal(response.status, 200);
  const policy = policyOf(response), scripts = policy.get('script-src');
  assert.ok(scripts?.includes("'self'")); assert.ok(scripts.includes("'strict-dynamic'"));
  assert.equal(scripts.includes("'unsafe-inline'"), false); assert.equal(scripts.includes("'unsafe-eval'"), false);
  const nonces = scripts.filter((value) => /^'nonce-[a-f0-9]{64}'$/.test(value));
  assert.equal(nonces.length, 1); const nonce = nonces[0].slice(7, -1);
  assert.deepEqual(policy.get('style-src'), ["'self'", "'unsafe-inline'"]);
  assert.deepEqual(policy.get('frame-ancestors'), ["'none'"]);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
  return nonce;
}
async function navigateDocument(path) {
  await cdp.evaluate(`window.__atomicFixtureNavigationMarker=true`);
  await cdp.call('Page.navigate', { url: communityBase + path });
  await waitFor(() => cdp.evaluate(`!window.__atomicFixtureNavigationMarker&&document.readyState==='complete'&&Boolean(document.querySelector('main'))`));
}
async function nonceInDocument() {
  const nonces = await cdp.evaluate(`Array.from(document.scripts).map(s=>s.nonce).filter(Boolean)`);
  assert.ok(nonces.length > 0); assert.ok(nonces.every((nonce) => nonce === nonces[0]));
  assert.match(nonces[0], /^[a-f0-9]{64}$/); return nonces[0];
}
async function nativeLogin() {
  await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[placeholder="First key"]'))`));
  for (const [placeholder, value] of [['First key', FIRST], ['Second key', SECOND]]) {
    await cdp.evaluate(`(()=>{const input=document.querySelector('input[placeholder=${JSON.stringify(placeholder)}]');if(!input)throw Error('missing');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await delay(40);
    await cdp.evaluate(`document.querySelector('input[placeholder=${JSON.stringify(placeholder)}]').form.requestSubmit()`);
    await waitFor(() => cdp.evaluate(placeholder === 'First key'
      ? `Boolean(document.querySelector('input[placeholder="Second key"]'))`
      : `Boolean(document.querySelector('.tabs'))`));
  }
}
async function cleanup() {
  let clean = true;
  for (const gate of gates) gate.release(503, { error: 'fixture_closed' });
  if (cdp) {
    // Let Chrome reap its children before the owned-process-group fallback.
    try { await cdp.call('Browser.close'); } catch { /* close may precede its acknowledgement */ }
    try { cdp.socket.close(); } catch { clean = false; }
  }
  for (const record of children.reverse()) {
    const { child, stopped } = record;
    if (child.pid) {
      try { process.platform === 'win32' ? child.kill('SIGTERM') : process.kill(-child.pid, 'SIGTERM'); } catch { /* already exited */ }
      try { await bounded(stopped, 5000); } catch {
        try { process.platform === 'win32' ? child.kill('SIGKILL') : process.kill(-child.pid, 'SIGKILL'); } catch { /* already exited */ }
        try { await bounded(stopped, 5000); } catch { clean = false; }
      }
      if (process.platform !== 'win32') {
        const groupExists = () => { try { process.kill(-child.pid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; } };
        try { await waitFor(() => !groupExists(), 2000); } catch {
          try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already exited */ }
          try { await waitFor(() => !groupExists(), 3000); } catch { clean = false; }
        }
      }
    }
    if (child.pid && child.exitCode === null && child.signalCode === null) clean = false;
    record.discard();
  }
  if (backend) { try { await bounded(new Promise((done) => { backend.close(done); backend.closeAllConnections(); }), 5000); } catch { clean = false; } }
  if (ownedTemp) { try {
    assert.equal(resolve(ownedTemp), ownedTemp);
    assert.ok(basename(ownedTemp).startsWith('atomic-controller-wallet-browser-'));
    assert.equal(resolve(ownedTemp, '..'), resolve(tmpdir()));
    await rm(ownedTemp, { recursive: true, force: true });
    try { await access(ownedTemp); clean = false; } catch { /* expected absence */ } } catch { clean = false; } }
  return clean;
}

try {
  ownedTemp = await mkdtemp(join(tmpdir(), 'atomic-controller-wallet-browser-'));
  await startBackend();
  const reservation = createServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
  const port = reservation.address().port; await new Promise((done) => reservation.close(done));
  communityBase = `http://127.0.0.1:${port}`;
  ownedChild(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', ADMIN_PASSWORD: FIRST, ADMIN_PASSWORD_2: SECOND,
    SESSION_SECRET: 'wallet-fixture-session-secret-0123456789', ADMIN_API_KEY: 'wallet-fixture-admin-key', ATOMIC_SERVER_URL: backendBase });
  await waitFor(async () => { try { return (await fetch(communityBase + '/api/controller/session', { signal: AbortSignal.timeout(1000) })).ok; } catch { return false; } }, 25000);
  await startBrowser(); await resetUI(); cases.browser_setup = 'pass'; cspCases.browser_setup = 'pass';
  await runCase('input_retires_account', async () => {
    await initialA(); await emailInput(B); const state = await snapshot();
    assert.equal(state.found, ''); assert.equal(state.applyEnabled, false); assert.equal(energyRequests.length, 0);
  });
  await runCase('reverse_lookup', async () => {
    const a = hold('user', A); await emailInput(A, true); await waitFor(() => a.seen);
    const b = hold('user', B); await emailInput(B, true); await waitFor(() => b.seen);
    b.release(200, user(B, 70)); await assertFound(B, 70);
    a.release(200, user(A, 1)); await delay(250); await assertFound(B, 70); assert.equal(energyRequests.length, 0);
  });
  await runCase('stale_failure_completion', async () => {
    const a = hold('user', A); await emailInput(A, true); await waitFor(() => a.seen);
    const b = hold('user', B); await emailInput(B, true); await waitFor(() => b.seen);
    a.release(503, { error: 'fixture_stale_lookup_error' }); await delay(250);
    const state = await snapshot(); assert.equal(state.lookupDisabled, true); assert.equal(state.body.includes('fixture_stale_lookup_error'), false);
    b.release(200, user(B)); await assertFound(B);
  });
  await runCase('same_owner_page_generation', async () => {
    await initialA(); const page = hold('page', A); await click('Load more batches'); await waitFor(() => page.seen);
    await emailInput(B, true); await assertFound(B);
    const fresh = hold('user', A); await emailInput(A, true); await waitFor(() => fresh.seen);
    fresh.release(200, user(A, 99, [batch('new-generation')], 'fixture-fresh-page')); await assertFound(A, 99);
    page.release(200, details([batch('obsolete-generation')], null)); await delay(250);
    const state = await snapshot(); assert.equal(state.text.includes('obsolete-generation'), false);
    assert.equal(state.text.includes('new-generation'), true); await assertFound(A, 99);
  });
  await runCase('same_owner_refresh_generation', async () => {
    await initialA(); const energy = hold('energy', A); const refresh = hold('user', A);
    await applyOne(); await waitFor(() => energy.seen); energy.release(200, { ok: true, user_id: ids[A], coins: 51, energy: 20 });
    await waitFor(() => refresh.seen); await emailInput(B); await emailInput(A);
    refresh.release(200, user(A, 1)); await delay(250);
    const state = await snapshot(); assert.equal(state.found, ''); assert.equal(state.applyEnabled, false);
    await emailInput(A, true); await assertFound(A, 50); assert.equal(energyRequests.length, 1); assert.equal(creditCount, 1);
  });
  await runCase('unmount_retires_read', async () => {
    const a = hold('user', A); await emailInput(A, true); await waitFor(() => a.seen);
    await cdp.evaluate(`document.querySelectorAll('.tabs button')[0].click()`);
    a.release(503, { error: 'fixture_unmounted_lookup_error' }); await delay(250);
    assert.equal(await cdp.evaluate(`document.body.textContent.includes('fixture_unmounted_lookup_error')`), false);
    await readyEconomy(); assert.equal((await snapshot()).found, '');
  });
  await runCase('settled_adjustment_input_change', async () => {
    await initialA(); const energy = hold('energy', A); await applyOne(); await waitFor(() => energy.seen);
    const saved = (await snapshot()).pending; assert.ok(saved); await emailInput(B);
    assert.equal((await snapshot()).pending, saved);
    energy.release(200, { ok: true, user_id: ids[A], coins: 51, energy: 20 });
    await waitFor(async () => (await snapshot()).pending === null);
    const state = await snapshot(); assert.equal(state.found, ''); assert.equal(state.applyEnabled, false);
    assert.equal(energyRequests.length, 1); assert.equal(energyRequests[0].user_id, ids[A]); assert.equal(creditCount, 1);
  });
  await runCase('ambiguous_adjustment_unmount', async () => {
    await initialA(); const energy = hold('energy', A); await applyOne(); await waitFor(() => energy.seen);
    const saved = (await snapshot()).pending; assert.ok(saved);
    await cdp.evaluate(`document.querySelectorAll('.tabs button')[0].click()`);
    energy.release(503, { error: 'fixture_ambiguous_adjustment' }); await delay(250);
    assert.equal(await cdp.evaluate(`localStorage.getItem('atomic-controller-pending-adjustment-v1')`), saved);
    assert.equal(await cdp.evaluate(`document.body.textContent.includes('fixture_ambiguous_adjustment')`), false);
    await readyEconomy(); await waitFor(async () => (await snapshot()).text.includes('Retry saved adjustment'));
    await click('Retry saved adjustment'); await waitFor(async () => (await snapshot()).pending === null);
    assert.equal(energyRequests.length, 2); assert.equal(energyRequests[0].request_id, energyRequests[1].request_id); assert.equal(creditCount, 1);
  });
  await runCase('current_page_deduplication', async () => {
    await initialA(); await click('Load more batches');
    await waitFor(async () => (await snapshot()).text.includes('page-second'));
    const state = await snapshot(); assert.equal(state.text.split('base-first').length - 1, 1);
    assert.equal(state.text.split('page-second').length - 1, 1); assert.equal(state.text.includes('Load more batches'), false);
    assert.equal(energyRequests.length, 0);
  });
  await runCase('settled_adjustment_preserves_other_pending', async () => {
    await initialA(); const energy = hold('energy', A);
    const requestsBefore = new Set(cdp.energyRequests);
    await applyOne(); await waitFor(() => energy.seen);
    await waitFor(() => [...cdp.energyRequests].some(id => !requestsBefore.has(id)));
    const newRequests = [...cdp.energyRequests].filter(id => !requestsBefore.has(id));
    assert.equal(newRequests.length, 1); const requestId = newRequests[0];
    const aSaved = (await snapshot()).pending; assert.ok(aSaved);
    await cdp.evaluate(`document.querySelectorAll('.tabs button')[0].click()`);
    const other = JSON.stringify({ request_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      user_id: ids[B], coins_delta: 2, energy_delta: 0, note: 'synthetic other-panel request' });
    assert.notEqual(other, aSaved);
    await cdp.evaluate(`localStorage.setItem('atomic-controller-pending-adjustment-v1',${JSON.stringify(other)})`);
    energy.release(200, { ok: true, user_id: ids[A], coins: 51, energy: 20 });
    // Observe actual HTTP-body completion, then drain the browser's UI task queue.
    // This is not a timing guess or a copied settlement implementation.
    await waitFor(() => cdp.finishedEnergyRequests.has(requestId));
    await cdp.evaluate(`new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done(true))))`);
    assert.equal(await cdp.evaluate(`localStorage.getItem('atomic-controller-pending-adjustment-v1')`), other);
    assert.equal(energyRequests.length, 1); assert.equal(energyRequests[0].user_id, ids[A]); assert.equal(creditCount, 1);
    await readyEconomy();
    await waitFor(async () => (await snapshot()).pending === other);
    const state = await snapshot(); assert.equal(state.text.includes(ids[B]), true); assert.equal(state.text.includes('Retry saved adjustment'), true);
    assert.equal(energyRequests.length, 1); // Merely remounting must not send the saved B request.
  });
  await runCspCase('document_headers', async () => {
    const response = await fetch(communityBase + '/controller', { signal: AbortSignal.timeout(7000) });
    const nonce = controllerPolicy(response), html = await response.text();
    const tags = html.match(/<script\b[^>]*>/g) ?? []; assert.ok(tags.length > 0);
    assert.ok(tags.every((tag) => tag.includes(`nonce="${nonce}"`)));
    assert.equal(response.headers.has('x-nonce'), false); // rendering input is not a new public response header
  });
  await runCspCase('spoofed_request_headers', async () => {
    const forged = 'a'.repeat(64);
    const response = await fetch(communityBase + '/controller', { signal: AbortSignal.timeout(7000),
      headers: { 'x-nonce': forged, 'content-security-policy': "script-src 'unsafe-inline' 'nonce-" + forged + "'" } });
    const nonce = controllerPolicy(response); assert.notEqual(nonce, forged);
    const html = await response.text(), tags = html.match(/<script\b[^>]*>/g) ?? [];
    assert.ok(tags.length > 0); assert.ok(tags.every((tag) => tag.includes(`nonce="${nonce}"`)));
  });
  await runCspCase('dom_script_block_and_authorize', async () => {
    domProbePhase = 'read_nonce';
    const nonce = await nonceInDocument();
    // Inspector evaluation may bypass CSP even for synchronous DOM side
    // effects. It only registers this handler; actual native browser input
    // invokes it after the evaluation has returned, in the document event loop.
    domProbePhase = 'prepare_native_probe';
    const point = await cdp.evaluate(`(()=>{window.__atomicCspViolations=[];const record=e=>window.__atomicCspViolations.push({blocked:e.blockedURI,directive:e.effectiveDirective});document.addEventListener('securitypolicyviolation',record);const b=document.createElement('button');b.id='atomic-native-probe';b.textContent='Generated policy probe';b.style.cssText='position:fixed;left:0;bottom:0;width:200px;height:40px;z-index:2147483647';b.addEventListener('click',()=>{const denied=document.createElement('script');denied.id='atomic-unauthorized-probe';denied.addEventListener('securitypolicyviolation',record);denied.textContent='window.__atomicUnauthorizedProbe=true';document.head.append(denied);const allowed=document.createElement('script');allowed.nonce=${JSON.stringify(nonce)};allowed.textContent='window.__atomicAuthorizedProbe=true';document.head.append(allowed);allowed.remove();},{once:true});document.body.append(b);const r=b.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    domProbePhase = 'native_probe_click';
    await cdp.call('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await cdp.call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    domProbePhase = 'wait_violation';
    await waitFor(() => cdp.evaluate(`window.__atomicCspViolations.some(e=>e.blocked==='inline'&&e.directive.startsWith('script-src'))`));
    domProbePhase = 'check_blocked';
    assert.equal(await cdp.evaluate(`window.__atomicUnauthorizedProbe===true`), false);
    await cdp.evaluate(`document.getElementById('atomic-unauthorized-probe').remove()`);
    await cdp.evaluate(`document.getElementById('atomic-native-probe').remove()`);
    domProbePhase = 'check_authorized';
    assert.equal(await cdp.evaluate(`window.__atomicAuthorizedProbe===true`), true);
    domProbePhase = 'economy_adjustment';
    await initialA(); await applyOne(); await waitFor(async () => (await snapshot()).pending === null);
    assert.equal(creditCount, 1);
    domProbePhase = 'complete';
  });
  await runCspCase('fresh_document_nonce', async () => {
    const before = await nonceInDocument(); await navigateDocument('/controller'); await readyEconomy();
    assert.notEqual(await nonceInDocument(), before);
  });
  await runCspCase('native_login_logout', async () => {
    await cdp.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Log out everywhere').click()`);
    await nativeLogin(); await readyEconomy(); await initialA();
    assert.equal((await snapshot()).found.includes(A), true);
    await cdp.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Log out everywhere').click()`);
    await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[placeholder="First key"]'))`));
    assert.equal(await cdp.evaluate(`Boolean(document.querySelector('.tabs'))`), false);
    assert.equal(await cdp.evaluate(`(async()=>{const r=await fetch('/api/controller/session');return (await r.json()).admin})()`), false);
  });
  await runCspCase('public_document_navigation', async () => {
    const before = await nonceInDocument();
    await cdp.evaluate(`(()=>{window.__atomicFixtureNavigationMarker=true;const a=document.createElement('a');a.href='/';document.body.append(a);a.click();})()`);
    await waitFor(() => cdp.evaluate(`!window.__atomicFixtureNavigationMarker&&document.readyState==='complete'&&Boolean(document.querySelector('main'))`));
    assert.ok(await cdp.evaluate(`document.body.textContent.includes('Generated public fixture notice')`));
    // Negative policy control: the same native-event insertion is intentionally
    // permitted on a public document, whose inline policy is unchanged.
    const point = await cdp.evaluate(`(()=>{const b=document.createElement('button');b.id='atomic-public-probe';b.textContent='Generated public policy probe';b.style.cssText='position:fixed;left:0;bottom:0;width:200px;height:40px;z-index:2147483647';b.addEventListener('click',()=>{const s=document.createElement('script');s.textContent='window.__atomicPublicInlineProbe=true';document.head.append(s);s.remove();},{once:true});document.body.append(b);const r=b.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    await cdp.call('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await cdp.call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    await waitFor(() => cdp.evaluate(`window.__atomicPublicInlineProbe===true`));
    await cdp.evaluate(`document.getElementById('atomic-public-probe').remove()`);
    await cdp.evaluate(`(()=>{window.__atomicFixtureNavigationMarker=true;const a=document.createElement('a');a.href='/controller';document.body.append(a);a.click();})()`);
    await waitFor(() => cdp.evaluate(`!window.__atomicFixtureNavigationMarker&&document.readyState==='complete'&&Boolean(document.querySelector('main'))`));
    await readyEconomy(); assert.notEqual(await nonceInDocument(), before);
  });
  await runCspCase('public_headers_static_blog', async () => {
    const manifest = JSON.parse(await readFile(resolve('.next/prerender-manifest.json'), 'utf8'));
    const staticBlog = Object.entries(manifest.routes).filter(([path]) => path.startsWith('/blog/'));
    assert.ok(staticBlog.length > 0); assert.ok(staticBlog.every(([, info]) => info.initialRevalidateSeconds === false));
    for (const path of ['/', '/updates', '/blog', staticBlog[0][0], '/api/controller/session']) {
      const response = await fetch(communityBase + path, { signal: AbortSignal.timeout(7000) });
      assert.equal(response.status, 200); const policy = policyOf(response), scripts = policy.get('script-src');
      assert.ok(scripts.includes("'unsafe-inline'")); assert.equal(scripts.some((value) => value.startsWith("'nonce-")), false);
      assert.equal(scripts.includes("'unsafe-eval'"), false);
      if (path.startsWith('/blog/')) { assert.equal((response.headers.get('cache-control') ?? '').includes('no-store'), false);
        assert.match(await response.text(), /application\/ld\+json/); }
      if (path === '/' || path === '/updates') assert.match(await response.text(), /Generated public fixture notice/);
    }
  });
  await runCspCase('api_origin_boundary', async () => {
    const response = await fetch(communityBase + '/api/controller/logout', { method: 'POST',
      headers: { origin: 'https://unrelated.example.test' }, signal: AbortSignal.timeout(7000) });
    assert.equal(response.status, 403);
    const same = await cdp.evaluate(`(async()=>{const r=await fetch('/api/controller/session');return r.ok&&(await r.json()).admin})()`);
    assert.equal(same, true); // refused cross-origin mutation did not log out
    const api = await fetch(communityBase + '/api/controller/session');
    assert.match(api.headers.get('cache-control') ?? '', /no-store/);
    assert.equal(api.headers.get('x-frame-options'), 'DENY');
  });
} catch { cases.browser_setup = 'fail'; }
finally {
  cases.cleanup = await cleanup() ? 'pass' : 'fail';
  cspCases.cleanup = cases.cleanup;
  const passed = CASES.every((name) => cases[name] === 'pass');
  const proof = { version: 1, scope: 'real Controller DOM; generated localhost wallet API; no production or release claim',
    source_head: sourceHead, phase: 'complete', outcome: passed ? 'pass' : 'fail', cases };
  await writeFile(resolve(proofFile), JSON.stringify(proof, null, 2) + '\n', 'utf8');
  const cspPassed = CSP_CASES.every((name) => cspCases[name] === 'pass');
  const cspProof = { version: 1, scope: 'Controller document script nonces; real DOM and generated localhost APIs; public inline styles and same-origin trust remain',
    source_head: sourceHead, phase: 'complete', outcome: cspPassed ? 'pass' : 'fail', cases: cspCases, dom_probe_phase: domProbePhase };
  await writeFile(resolve(cspProofFile), JSON.stringify(cspProof, null, 2) + '\n', 'utf8');
  process.stdout.write(JSON.stringify(proof) + '\n'); process.stdout.write(JSON.stringify(cspProof) + '\n');
  process.exitCode = passed && cspPassed ? 0 : 1;
}
