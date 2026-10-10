# TaskFlow – Task Management System

A full-stack task manager built with **React (Vite)** and **Node.js + Express**. Tasks live in backend memory only (no database), so data resets whenever the server restarts.

## Features

- Dashboard with task cards: title, description, status, priority, due and created date
- Create, edit, view (details modal) and delete tasks, with a confirmation step on delete
- Client-side form validation plus server-side validation, with server errors shown next to the fields
- Loading (skeleton), empty, filtered-empty and error (with retry) states
- Responsive layout for desktop and mobile (modals become bottom sheets on small screens)
- **Bonus:** debounced search, status/priority filters, sorting (created date, due date, priority, title), pagination, dark mode (persisted, follows the OS by default), Swagger UI and a Postman collection

## Tech stack

| Layer    | Tech                                                  |
| -------- | ----------------------------------------------------- |
| Frontend | React 19, Vite, plain CSS (CSS variables for theming) |
| Backend  | Node.js, Express 4, cors, dotenv, swagger-ui-express  |
| Storage  | In-memory array                                       |
| Tests    | Node built-in test runner (`node:test`)               |

## Project structure

```
backend/
├── src/
│   ├── config/env.js            # environment variables
│   ├── routes/task.routes.js
│   ├── controllers/task.controller.js
│   ├── services/task.service.js # in-memory store + search/filter/sort/paginate
│   ├── middleware/
│   │   ├── validateTask.js      # request validation
│   │   └── errorHandler.js      # centralized error handling + 404
│   ├── utils/                   # ApiError, constants
│   ├── docs/openapi.js          # Swagger spec
│   ├── app.js
│   └── server.js
├── tests/tasks.test.js
└── .env.example
frontend/
├── src/
│   ├── services/api.js          # all HTTP calls live here
│   ├── hooks/                   # useTasks, useDebounce, useTheme
│   ├── components/              # Header, TaskFilters, TaskCard, TaskList, TaskForm,
│   │                            # TaskDetails, Modal, ConfirmDialog, Pagination, StateViews, Toast, Badges
│   ├── utils/                   # constants, formatting, validation
│   ├── App.jsx
│   └── main.jsx
└── .env.example
docs/postman_collection.json
```

## Getting started

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
npm run dev              # or: npm start
```

The API runs on <http://localhost:5000>. Swagger UI is at <http://localhost:5000/api/docs>.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5173>.

### Environment variables

| File            | Variable       | Default                     | Purpose                                            |
| --------------- | -------------- | --------------------------- | -------------------------------------------------- |
| `backend/.env`  | `PORT`         | `5000`                      | API port                                           |
| `backend/.env`  | `CORS_ORIGIN`  | `http://localhost:5173`     | Allowed frontend origin(s), comma separated        |
| `backend/.env`  | `NODE_ENV`     | `development`               | In `production`, 500 errors hide internal messages |
| `backend/.env`  | `SEED_DATA`    | `true`                      | Load sample tasks on startup                       |
| `frontend/.env` | `VITE_API_URL` | `http://localhost:5000/api` | Backend base URL                                   |

### Scripts

| Where    | Command         | What it does                  |
| -------- | --------------- | ----------------------------- |
| backend  | `npm run dev`   | Start with auto-restart       |
| backend  | `npm start`     | Start normally                |
| backend  | `npm test`      | Run API tests                 |
| frontend | `npm run dev`   | Start the dev server          |
| frontend | `npm run build` | Production build into `dist/` |

## API documentation

Base URL: `http://localhost:5000`. Interactive docs: `/api/docs` (Swagger UI). A Postman collection is in [`docs/postman_collection.json`](docs/postman_collection.json) (import it, then run "Create task" first so `{{taskId}}` is set).

### Task object

```json
{
  "id": "3f0c7c1e-8a3b-4a52-9f7e-0c6a1d2b9e11",
  "title": "Complete assignment",
  "description": "Build the full-stack task manager",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-10-05",
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-01T09:00:00.000Z"
}
```

| Field         | Rules                                               |
| ------------- | --------------------------------------------------- |
| `title`       | required, string, max 100 chars                     |
| `description` | required, string, max 1000 chars                    |
| `status`      | `pending` (default) \| `in_progress` \| `completed` |
| `priority`    | `low` \| `medium` (default) \| `high`               |
| `dueDate`     | optional, `YYYY-MM-DD` or `null`                    |

### Endpoints

| Method | Endpoint         | Purpose                                                            | Success | Errors            |
| ------ | ---------------- | ------------------------------------------------------------------ | ------- | ----------------- |
| GET    | `/api/tasks`     | List tasks (search, filter, sort, paginate)                        | 200     | 400 invalid query |
| GET    | `/api/tasks/:id` | Get one task                                                       | 200     | 404               |
| POST   | `/api/tasks`     | Create a task                                                      | 201     | 400               |
| PUT    | `/api/tasks/:id` | Update a task (only supplied fields change; at least one required) | 200     | 400, 404          |
| DELETE | `/api/tasks/:id` | Delete a task                                                      | 200     | 404               |
| GET    | `/api/health`    | Health check                                                       | 200     |                   |

#### `GET /api/tasks` query parameters

| Param      | Values                                                        | Default     |
| ---------- | ------------------------------------------------------------- | ----------- |
| `search`   | text matched against title and description (case-insensitive) |             |
| `status`   | `pending` \| `in_progress` \| `completed`                     |             |
| `priority` | `low` \| `medium` \| `high`                                   |             |
| `sortBy`   | `createdAt` \| `dueDate` \| `priority` \| `title`             | `createdAt` |
| `order`    | `asc` \| `desc`                                               | `desc`      |
| `page`     | integer ≥ 1                                                   | `1`         |
| `limit`    | integer 1–100                                                 | `10`        |

Response:

```json
{
  "success": true,
  "data": [
    /* tasks */
  ],
  "meta": { "total": 24, "page": 1, "limit": 10, "totalPages": 3 }
}
```

#### Example: create

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete assignment","description":"Build the full-stack task manager","status":"pending","priority":"high","dueDate":"2026-10-05"}'
```

`201 Created` → `{ "success": true, "data": { ...task } }`

#### Error format

All errors share one shape, produced by the central error handler:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "title": "Title is required" }
}
```

`errors` is only present for validation failures (400). Unknown routes return a JSON 404 and malformed JSON returns 400.

## Design notes

- **Layering:** routes → controllers → services. Controllers only translate HTTP to service calls; the service owns the data and business rules; validation is middleware so controllers stay thin.
- **Service returns copies** of stored objects so callers can't mutate the store by accident.
- **Frontend data flow:** `services/api.js` is the only place that calls `fetch`; `useTasks` owns list fetching (aborting stale requests); `App` composes the pieces and refreshes the list after every mutation.
- **Debounced search:** the input updates instantly, the request fires 400 ms after typing stops.
- Searching, filtering, sorting and pagination run on the server, so they work the same for any client of the API.

## Screenshots

![alt text](image.png)
![alt text](image-1.png)
