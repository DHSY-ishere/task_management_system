const ApiError = require('../utils/ApiError');
const { STATUSES, PRIORITIES, SORT_FIELDS, SORT_ORDERS } = require('../utils/constants');

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Validates a task body. When `partial` is true (PUT), only supplied fields are
 * checked and returned; otherwise required fields are enforced and defaults applied.
 */
function validateTaskBody(body, { partial }) {
  const errors = {};
  const clean = {};

  if (!isPlainObject(body)) {
    throw ApiError.badRequest('Request body must be a JSON object');
  }

  const has = (key) => body[key] !== undefined;

  if (has('title') || !partial) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) errors.title = 'Title is required';
    else if (title.length > TITLE_MAX) errors.title = `Title must be at most ${TITLE_MAX} characters`;
    else clean.title = title;
  }

  if (has('description') || !partial) {
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!description) errors.description = 'Description is required';
    else if (description.length > DESCRIPTION_MAX)
      errors.description = `Description must be at most ${DESCRIPTION_MAX} characters`;
    else clean.description = description;
  }

  if (has('status')) {
    if (!STATUSES.includes(body.status)) errors.status = `Status must be one of: ${STATUSES.join(', ')}`;
    else clean.status = body.status;
  } else if (!partial) {
    clean.status = 'pending';
  }

  if (has('priority')) {
    if (!PRIORITIES.includes(body.priority))
      errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}`;
    else clean.priority = body.priority;
  } else if (!partial) {
    clean.priority = 'medium';
  }

  // dueDate is optional and nullable
  if (has('dueDate')) {
    if (body.dueDate === null || body.dueDate === '') clean.dueDate = null;
    else if (!isValidDate(body.dueDate)) errors.dueDate = 'Due date must be a valid date in YYYY-MM-DD format';
    else clean.dueDate = body.dueDate;
  } else if (!partial) {
    clean.dueDate = null;
  }

  if (Object.keys(errors).length) throw ApiError.badRequest('Validation failed', errors);
  return clean;
}

const validateCreateTask = (req, _res, next) => {
  try {
    req.body = validateTaskBody(req.body, { partial: false });
    next();
  } catch (err) {
    next(err);
  }
};

const validateUpdateTask = (req, _res, next) => {
  try {
    const clean = validateTaskBody(req.body, { partial: true });
    if (!Object.keys(clean).length) {
      throw ApiError.badRequest('Validation failed', { body: 'Provide at least one field to update' });
    }
    req.body = clean;
    next();
  } catch (err) {
    next(err);
  }
};

const toPositiveInt = (value, fallback, max = Infinity) => {
  if (value === undefined || value === '') return { value: fallback };
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return { error: true };
  return { value: Math.min(n, max) };
};

/** Parses and validates GET /api/tasks query params into `req.listQuery`. */
const validateListQuery = (req, _res, next) => {
  const { search, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
  const errors = {};

  if (status !== undefined && status !== '' && !STATUSES.includes(status))
    errors.status = `Status must be one of: ${STATUSES.join(', ')}`;
  if (priority !== undefined && priority !== '' && !PRIORITIES.includes(priority))
    errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}`;
  if (!SORT_FIELDS.includes(sortBy)) errors.sortBy = `sortBy must be one of: ${SORT_FIELDS.join(', ')}`;
  if (!SORT_ORDERS.includes(order)) errors.order = `order must be one of: ${SORT_ORDERS.join(', ')}`;

  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 10, 100);
  if (page.error) errors.page = 'page must be a positive integer';
  if (limit.error) errors.limit = 'limit must be a positive integer';

  if (Object.keys(errors).length) return next(ApiError.badRequest('Invalid query parameters', errors));

  req.listQuery = {
    search: typeof search === 'string' ? search.trim() : '',
    status: status || undefined,
    priority: priority || undefined,
    sortBy,
    order,
    page: page.value,
    limit: limit.value,
  };
  next();
};

module.exports = { validateCreateTask, validateUpdateTask, validateListQuery };
