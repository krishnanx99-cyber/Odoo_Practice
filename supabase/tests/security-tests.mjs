// TASK-024 ΓÇö Database/RLS security test suite (TASK-024).
//
// Real-client security tests against a Supabase project (GoTrue + PostgREST).
// Covers the plan ┬ºTASK-024 cases: student isolation, admin access, unauthorized
// booking changes, duplicate registration, invalid booking times, overlapping
// bookings, inactive resources, draft/cancelled/past events.
//
// Run:
//   $env:SUPABASE_URL='https://<ref>.supabase.co'
//   $env:SUPABASE_ANON_KEY='...'            # publishable/anon key
//   $env:SUPABASE_SERVICE_ROLE_KEY='...'    # service_role key (setup/cleanup only)
//   node supabase/tests/security-tests.mjs
//
// The script creates its own throwaway users + fixtures and deletes them at the
// end. It fails the process (exit 1) if any scenario does not behave as expected.
//
// Verification (against live project gmfhoqgskfgmppddtejh, 2026-08-19):
//   28/28 scenarios passed, run twice back-to-back, zero DB residue after each run.
//   Scenarios: anon denied (table read + RPC), student isolation (see/fetch/update
//   other student's booking), non-admin approve denied, draft/cancelled/past event
//   rejection, register/duplicate/cancel lifecycle, inactive resource, end-before-start,
//   overlapping approved booking, admin sees all + approve + reject, editable pending
//   booking (own edit, partial update, edit others denied, non-pending not editable,
//   overlap rejected, anon denied), capacity fill + block, registered_count sync.
//   All RLS policies verified correct; no DB defects found.

const URL = process.env.SUPABASE_URL || 'https://gmfhoqgskfgmppddtejh.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANON || !SERVICE) {
  console.error('Missing env. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(2);
}

const results = [];
function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
}

async function req(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(URL + path, {
    method,
    headers: { apikey: ANON, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
}

const json = { 'Content-Type': 'application/json' };

async function signIn(email, password) {
  const r = await req('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password }, headers: json });
  if (!r.data || !r.data.access_token) throw new Error(`signin ${email} failed (${r.status}): ${JSON.stringify(r.data)}`);
  return r.data.access_token;
}

const service = (extra = {}) => ({ ...json, Authorization: `Bearer ${SERVICE}`, ...extra });
const bearer = (token) => ({ ...json, Authorization: `Bearer ${token}` });

const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const uid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-8${hex(3)}-${hex(12)}`;

async function createUser(email, role) {
  const r = await req('/auth/v1/admin/users', {
    method: 'POST',
    headers: service(),
    body: { email, password: 'Password123!', email_confirm: true, app_metadata: { role } },
  });
  if (!r.data || !r.data.id) throw new Error(`create user ${email} failed: ${JSON.stringify(r.data)}`);
  return r.data;
}

async function deleteUser(id) {
  await req(`/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: service() });
}

async function rpc(token, fn, args) {
  return req(`/rest/v1/rpc/${fn}`, { method: 'POST', headers: bearer(token), body: args });
}

async function rpcAnon(fn, args) {
  return req(`/rest/v1/rpc/${fn}`, { method: 'POST', headers: json, body: args });
}

async function main() {
  const run = String(Date.now());
  const u1 = `sec-u1-${run}@test.com`;
  const u2 = `sec-u2-${run}@test.com`;
  const adm = 'admin@test.com';
  const evPub = uid();
  const evDraft = uid();
  const evCancelled = uid();
  const evPast = uid();
  const evFull = uid();
  const resActive = uid();
  const resInactive = uid();
  const loc = uid();
  const b1 = uid();
  let b2, b3, cu1, cu2, bEdit;
  let r;

  // ---------- setup (service key) ----------
  try {
  cu1 = await createUser(u1, 'student');
  cu2 = await createUser(u2, 'student');
  const t1 = await signIn(u1, 'Password123!');
  const t2 = await signIn(u2, 'Password123!');
  const ta = await signIn(adm, 'Password123!');

  const now = Date.now();
  const start = new Date(now + 2 * 3600 * 1000).toISOString();
  const end = new Date(now + 4 * 3600 * 1000).toISOString();
  const start2 = new Date(now + 6 * 3600 * 1000).toISOString();
  const end2 = new Date(now + 8 * 3600 * 1000).toISOString();

  // location
  r = await req('/rest/v1/locations', { method: 'POST', headers: service(), body: { id: loc, name: `Sec Test Hall ${run}` } });
  if (r.status >= 400) throw new Error(`fixture location failed: ${JSON.stringify(r.data)}`);

  // events
  for (const ev of [
    { id: evPub, title: 'Sec Pub', status: 'published' },
    { id: evDraft, title: 'Sec Draft', status: 'draft' },
    { id: evCancelled, title: 'Sec Cancelled', status: 'cancelled' },
    { id: evPast, title: 'Sec Past', status: 'published', start_time: new Date(now - 48 * 3600 * 1000).toISOString(), end_time: new Date(now - 46 * 3600 * 1000).toISOString() },
    { id: evFull, title: 'Sec Full', status: 'published', capacity: 1 },
  ]) {
    r = await req('/rest/v1/events', {
      method: 'POST',
      headers: service(),
      body: { id: ev.id, title: ev.title, category: 'tech', description: 't', status: ev.status, start_time: ev.start_time || start, end_time: ev.end_time || end, location_id: loc, capacity: ev.capacity || 100 },
    });
    if (r.status >= 400) throw new Error(`fixture event ${ev.title} failed: ${JSON.stringify(r.data)}`);
  }

  // resources
  for (const res of [{ id: resActive, name: `Sec Projector ${run}`, status: 'active' }, { id: resInactive, name: `Sec Broken ${run}`, status: 'inactive' }]) {
    r = await req('/rest/v1/resources', {
      method: 'POST',
      headers: service(),
      body: { id: res.id, name: res.name, category: 'equipment', description: 't', status: res.status, quantity_available: 1, location_id: loc },
    });
    if (r.status >= 400) throw new Error(`fixture resource ${res.name} failed: ${JSON.stringify(r.data)}`);
  }

  // approved booking on resActive held by u2 (blocks overlaps)
  const bk = await req('/rest/v1/bookings', {
    method: 'POST',
    headers: service(),
    body: { id: b1, resource_id: resActive, user_id: cu2.id, start_time: start, end_time: end, quantity: 1, status: 'approved', booking_reason: 'security test fixture' },
  });
  if (bk.status >= 400) throw new Error(`fixture booking failed: ${JSON.stringify(bk.data)}`);

  // ---------- scenarios ----------
  // 1-2 anon denied
  r = await req('/rest/v1/events?select=id&limit=1');
  check('anon denied events read', [401, 403].includes(r.status), `status=${r.status}`);

  r = await rpcAnon('check_availability', { p_resource_id: resActive, p_start_time: start, p_end_time: end, p_quantity: 1 });
  check('anon denied check_availability RPC', [401, 403].includes(r.status), `status=${r.status}`);

  // 3-4 student isolation
  r = await req('/rest/v1/bookings?select=id,user_id&user_id=eq.' + cu2.id, { headers: bearer(t1) });
  check('student1 cannot see student2 booking', r.status === 200 && Array.isArray(r.data) && r.data.length === 0, `status=${r.status} len=${r.data && r.data.length}`);

  r = await req('/rest/v1/bookings?select=id&id=eq.' + b1, { headers: bearer(t1) });
  check('student1 cannot fetch student2 booking by id', r.status === 200 && Array.isArray(r.data) && r.data.length === 0, `status=${r.status} len=${r.data && r.data.length}`);

  // 5 unauthorized booking change
  r = await req('/rest/v1/bookings?id=eq.' + b1, { method: 'PATCH', headers: { ...bearer(t1), Prefer: 'return=representation' }, body: { status: 'cancelled' } });
  check('student1 cannot update student2 booking', r.status === 200 && Array.isArray(r.data) && r.data.length === 0, `status=${r.status} changed=${r.data && r.data.length}`);

  // 6 student cannot approve
  r = await rpc(t1, 'approve_booking', { p_booking_id: b1 });
  check('student1 cannot approve booking', r.status >= 400 && /authorized/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  // 7-9 event gating
  r = await rpc(t1, 'register_for_event', { p_event_id: evDraft });
  check('draft event rejected', r.status >= 400 && /not open/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'register_for_event', { p_event_id: evCancelled });
  check('cancelled event rejected', r.status >= 400 && /not open/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'register_for_event', { p_event_id: evPast });
  check('past event rejected', r.status >= 400 && /ended/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  // 10-12 registration lifecycle
  r = await rpc(t1, 'register_for_event', { p_event_id: evPub });
  check('student1 registers for published event', r.status === 200 && r.data && r.data.user_id === cu1.id && r.data.status === 'registered', `status=${r.status} ${r.data && JSON.stringify(r.data)}`);

  r = await rpc(t1, 'register_for_event', { p_event_id: evPub });
  check('duplicate registration rejected', r.status >= 400 && /already registered/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'cancel_registration', { p_event_id: evPub });
  check('student1 cancels registration', r.status === 200 && r.data && r.data.status === 'cancelled', `status=${r.status} ${r.data && JSON.stringify(r.data)}`);

  // 13-15 booking validation
  r = await rpc(t1, 'create_booking', { p_resource_id: resInactive, p_start_time: start, p_end_time: end, p_quantity: 1, p_booking_reason: 'should fail' });
  check('inactive resource rejected', r.status >= 400 && /not active/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'create_booking', { p_resource_id: resActive, p_start_time: end, p_end_time: start, p_quantity: 1, p_booking_reason: 'should fail' });
  check('end-before-start rejected', r.status >= 400, `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'create_booking', { p_resource_id: resActive, p_start_time: start, p_end_time: end, p_quantity: 1, p_booking_reason: 'should fail' });
  check('overlapping approved booking rejected', r.status >= 400 && /quantity available/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  // 16-18 admin powers
  r = await req('/rest/v1/bookings?select=id', { headers: bearer(ta) });
  const adminSeesAll = r.status === 200 && r.data.length >= 1 && r.data.some((b) => b.id === b1);
  check('admin sees all bookings', adminSeesAll, `status=${r.status} count=${r.data && r.data.length}`);

  b2 = uid();
  await req('/rest/v1/bookings', { method: 'POST', headers: service(), body: { id: b2, resource_id: resActive, user_id: cu1.id, start_time: start2, end_time: end2, quantity: 1, status: 'pending', booking_reason: 'security test pending' } });

  r = await rpc(ta, 'approve_booking', { p_booking_id: b2 });
  check('admin approves booking', r.status === 200 && r.data && r.data.status === 'approved', `status=${r.status} ${r.data && JSON.stringify(r.data)}`);

  b3 = uid();
  await req('/rest/v1/bookings', { method: 'POST', headers: service(), body: { id: b3, resource_id: resActive, user_id: cu1.id, start_time: start2, end_time: end2, quantity: 1, status: 'pending', booking_reason: 'security test pending2' } });

  r = await rpc(ta, 'reject_booking', { p_booking_id: b3, p_rejection_reason: 'security test rejection' });
  check('admin rejects booking', r.status === 200 && r.data && r.data.status === 'rejected', `status=${r.status} ${r.data && JSON.stringify(r.data)}`);

  // 21-26 editable pending bookings (update_booking, migration 0009)
  const start3 = new Date(now + 10 * 3600 * 1000).toISOString();
  const end3 = new Date(now + 12 * 3600 * 1000).toISOString();
  bEdit = uid();
  await req('/rest/v1/bookings', { method: 'POST', headers: service(), body: { id: bEdit, resource_id: resActive, user_id: cu1.id, start_time: start3, end_time: end3, quantity: 1, status: 'pending', booking_reason: 'security test edit' } });

  r = await rpc(t1, 'update_booking', { p_booking_id: bEdit, p_start_time: start3, p_end_time: end3, p_quantity: 1, p_booking_reason: 'edited reason' });
  check('owner edits own pending booking', r.status === 200 && r.data && r.data.status === 'pending' && r.data.booking_reason === 'edited reason', `status=${r.status} ${r.data && JSON.stringify(r.data)}`);

  r = await rpc(t1, 'update_booking', { p_booking_id: bEdit, p_booking_reason: 'partial update' });
  check('partial update keeps times', r.status === 200 && r.data && r.data.booking_reason === 'partial update' && new Date(r.data.start_time).getTime() === new Date(start3).getTime(), `status=${r.status}`);

  r = await rpc(t1, 'update_booking', { p_booking_id: b1, p_booking_reason: 'hijack' });
  check('owner cannot edit someone else booking', r.status >= 400 && /own bookings/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'update_booking', { p_booking_id: b2, p_booking_reason: 'no' });
  check('non-pending booking not editable', r.status >= 400 && /pending/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpc(t1, 'update_booking', { p_booking_id: bEdit, p_start_time: start2, p_end_time: end2, p_quantity: 1 });
  check('edit overlapping approved rejected', r.status >= 400 && /quantity available/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  r = await rpcAnon('update_booking', { p_booking_id: bEdit, p_booking_reason: 'anon' });
  check('anon denied update_booking RPC', [401, 403].includes(r.status), `status=${r.status}`);

  // 27 capacity
  r = await rpc(t1, 'register_for_event', { p_event_id: evFull });
  check('student1 fills capacity', r.status === 200 && r.data && r.data.status === 'registered', `status=${r.status} ${r.data && JSON.stringify(r.data)}`);
  r = await rpc(t2, 'register_for_event', { p_event_id: evFull });
  check('capacity full blocks student2', r.status >= 400 && /capacity/i.test(r.data && r.data.message), `status=${r.status} ${r.data && r.data.message}`);

  // 20 count sync (published event has 0 registrations after cancel; full event has 1)
  r = await req('/rest/v1/events?select=registered_count&id=eq.' + evPub, { headers: bearer(ta) });
  const pubCount = r.data && r.data[0] && r.data[0].registered_count;
  check('registered_count synced after cancel', pubCount === 0, `registered_count=${pubCount}`);

  r = await req('/rest/v1/events?select=registered_count&id=eq.' + evFull, { headers: bearer(ta) });
  const fullCount = r.data && r.data[0] && r.data[0].registered_count;
  check('registered_count synced to capacity fill', fullCount === 1, `registered_count=${fullCount}`);
  } finally {
    // ---------- cleanup (service key); always runs even if a scenario throws ----------
    await req(`/rest/v1/events?id=in.(${evPub},${evDraft},${evCancelled},${evPast},${evFull})`, { method: 'DELETE', headers: service() });
    await req(`/rest/v1/bookings?id=in.(${b1},${b2},${b3},${bEdit})`, { method: 'DELETE', headers: service() });
    await req(`/rest/v1/resources?id=in.(${resActive},${resInactive})`, { method: 'DELETE', headers: service() });
    await req(`/rest/v1/locations?id=eq.${loc}`, { method: 'DELETE', headers: service() });
    if (cu1 && cu1.id) await deleteUser(cu1.id);
    if (cu2 && cu2.id) await deleteUser(cu2.id);
  }

  const failed = results.filter((x) => !x.pass);
  console.log(`\n${results.length - failed.length}/${results.length} scenarios passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
