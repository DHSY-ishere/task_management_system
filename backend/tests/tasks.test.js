const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const taskService = require('../src/services/task.service');

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());
beforeEach(() => taskService.reset());

const call = async (method, path, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const valid = { title: 'Write tests', description: 'Cover the API' };

test('POST /api/tasks creates a task with defaults (201)', async () => {
  const res = await call('POST', '/api/tasks', valid);
  assert.equal(res.status, 201);
  assert.equal(res.body.data.status, 'pending');
  assert.equal(res.body.data.priority, 'medium');
  assert.equal(res.body.data.dueDate, null);
  assert.ok(res.body.data.id && res.body.data.createdAt && res.body.data.updatedAt);
});

test('POST /api/tasks rejects invalid input (400)', async () => {
  const res = await call('POST', '/api/tasks', { title: ' ', status: 'nope', dueDate: '2026-13-40' });
  assert.equal(res.status, 400);
  assert.deepEqual(Object.keys(res.body.errors).sort(), ['description', 'dueDate', 'status', 'title']);
});

test('POST /api/tasks rejects malformed JSON (400)', async () => {
  const res = await fetch(base + '/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad',
  });
  assert.equal(res.status, 400);
});

test('GET /api/tasks/:id returns 200 then 404', async () => {
  const { body } = await call('POST', '/api/tasks', valid);
  assert.equal((await call('GET', `/api/tasks/${body.data.id}`)).status, 200);
  assert.equal((await call('GET', '/api/tasks/missing')).status, 404);
});

test('PUT /api/tasks/:id updates fields, bumps updatedAt, 404 when missing', async () => {
  const { body } = await call('POST', '/api/tasks', valid);
  await new Promise((r) => setTimeout(r, 5));
  const res = await call('PUT', `/api/tasks/${body.data.id}`, { status: 'completed' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.status, 'completed');
  assert.equal(res.body.data.title, valid.title);
  assert.notEqual(res.body.data.updatedAt, body.data.updatedAt);
  assert.equal((await call('PUT', '/api/tasks/missing', { status: 'pending' })).status, 404);
  assert.equal((await call('PUT', `/api/tasks/${body.data.id}`, { title: '' })).status, 400);
  assert.equal((await call('PUT', `/api/tasks/${body.data.id}`, {})).status, 400);
});

test('DELETE /api/tasks/:id removes the task, 404 afterwards', async () => {
  const { body } = await call('POST', '/api/tasks', valid);
  assert.equal((await call('DELETE', `/api/tasks/${body.data.id}`)).status, 200);
  assert.equal((await call('DELETE', `/api/tasks/${body.data.id}`)).status, 404);
});

test('GET /api/tasks supports search, filter, sort and pagination', async () => {
  const make = (title, description, priority, status, dueDate) =>
    call('POST', '/api/tasks', { title, description, priority, status, dueDate });
  await make('Alpha', 'first', 'low', 'pending', '2026-12-01');
  await make('Beta', 'second thing', 'high', 'completed', null);
  await make('Gamma', 'third', 'medium', 'pending', '2026-11-01');

  const search = await call('GET', '/api/tasks?search=THING');
  assert.deepEqual(search.body.data.map((t) => t.title), ['Beta']);

  const filtered = await call('GET', '/api/tasks?status=pending&priority=low');
  assert.deepEqual(filtered.body.data.map((t) => t.title), ['Alpha']);

  const byPriority = await call('GET', '/api/tasks?sortBy=priority&order=desc');
  assert.deepEqual(byPriority.body.data.map((t) => t.title), ['Beta', 'Gamma', 'Alpha']);

  const byDue = await call('GET', '/api/tasks?sortBy=dueDate&order=asc');
  assert.deepEqual(byDue.body.data.map((t) => t.title), ['Gamma', 'Alpha', 'Beta']);

  const page2 = await call('GET', '/api/tasks?limit=2&page=2&sortBy=title&order=asc');
  assert.deepEqual(page2.body.data.map((t) => t.title), ['Gamma']);
  assert.deepEqual(page2.body.meta, { total: 3, page: 2, limit: 2, totalPages: 2 });

  assert.equal((await call('GET', '/api/tasks?status=bogus')).status, 400);
  assert.equal((await call('GET', '/api/tasks?page=0')).status, 400);
});

test('unknown routes return a JSON 404', async () => {
  const res = await call('GET', '/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
