const { randomUUID } = require('crypto');
const ApiError = require('../utils/ApiError');

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

/** In-memory store. Data resets when the server restarts. */
let tasks = [];

const clone = (task) => ({ ...task });

const compareBy = (field) => (a, b) => {
  if (field === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (field === 'title') return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  // createdAt / dueDate are ISO strings, which sort lexicographically
  return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
};

function sortTasks(list, sortBy, order) {
  const direction = order === 'asc' ? 1 : -1;
  const compare = compareBy(sortBy);
  return [...list].sort((a, b) => {
    // Tasks without a due date always go last
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
    }
    return compare(a, b) * direction;
  });
}

function list({ search, status, priority, sortBy, order, page, limit }) {
  let result = tasks;

  if (status) result = result.filter((t) => t.status === status);
  if (priority) result = result.filter((t) => t.priority === priority);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }

  result = sortTasks(result, sortBy, order);

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    data: result.slice(start, start + limit).map(clone),
    meta: { total, page, limit, totalPages },
  };
}

function findOrThrow(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) throw ApiError.notFound(`Task with id "${id}" not found`);
  return task;
}

function getById(id) {
  return clone(findOrThrow(id));
}

function create(input) {
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return clone(task);
}

function update(id, changes) {
  const task = findOrThrow(id);
  Object.assign(task, changes, { updatedAt: new Date().toISOString() });
  return clone(task);
}

function remove(id) {
  const task = findOrThrow(id);
  tasks = tasks.filter((t) => t.id !== id);
  return clone(task);
}

/** Replace the whole store (used for seeding and tests). */
function reset(initial = []) {
  tasks = initial.map(clone);
}

function seed() {
  const day = 24 * 60 * 60 * 1000;
  const iso = (offsetDays) => new Date(Date.now() + offsetDays * day).toISOString();
  const make = (title, description, status, priority, dueOffset, createdOffset) => ({
    id: randomUUID(),
    title,
    description,
    status,
    priority,
    dueDate: dueOffset === null ? null : iso(dueOffset).slice(0, 10),
    createdAt: iso(createdOffset),
    updatedAt: iso(createdOffset),
  });

  reset([
    make('Complete assignment', 'Build the full-stack task manager', 'in_progress', 'high', 3, -5),
    make('Write API documentation', 'Document every endpoint with Swagger and Postman', 'pending', 'medium', 5, -4),
    make('Review pull requests', 'Go through open PRs from the team', 'pending', 'low', null, -3),
    make('Fix login page bug', 'Users on mobile cannot see the submit button', 'completed', 'high', -1, -7),
    make('Plan sprint demo', 'Prepare slides and a short walkthrough', 'pending', 'medium', 8, -2),
    make('Update dependencies', 'Bump outdated npm packages and run the tests', 'in_progress', 'low', 10, -1),
  ]);
}

module.exports = { list, getById, create, update, remove, reset, seed };
