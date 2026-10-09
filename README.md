# Foci Todo Application

A full-stack to-do application built as part of the Foci Solutions technical assessment.

The application allows users to create, view, update, complete, reopen, filter, sort, and delete tasks.

The project is structured as a lightweight monorepo containing a React frontend and an Express API backed by PostgreSQL.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- TanStack Query

### Backend

- Node.js
- Express
- TypeScript
- Zod
- TypeORM
- PostgreSQL

### Testing

- Vitest
- Supertest

### Infrastructure

- Docker
- Docker Compose

## Project Structure

```text
foci-todo/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── constants/
│   │   │   ├── entities/
│   │   │   ├── errors/
│   │   │   ├── middleware/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── todos/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   └── Dockerfile
│   │
│   └── web/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── types/
│       └── Dockerfile
│
├── CLAUDE.md
├── docker-compose.yaml
├── package.json
└── README.md
```

The root project uses npm workspaces to manage the frontend and backend applications.

## Architecture

### Backend

The backend follows a layered architecture:

```text
HTTP Request
    ↓
Route / Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
TypeORM
    ↓
PostgreSQL
```

Each layer has a specific responsibility.

#### Routes and Middleware

Routes define the HTTP interface and apply request validation.

Zod is used to validate request bodies, route parameters, and query parameters before requests reach the controller.

Todo-specific routes are separated between collection routes and individual resource routes.

```text
GET    /todos
POST   /todos

GET    /todos/:id
PATCH  /todos/:id
DELETE /todos/:id
```

For routes operating on a specific todo, a middleware fetches the requested entity before the controller executes.

```text
/todos/:id
    ↓
Validate UUID
    ↓
Fetch Todo
    ↓
Controller
```

This avoids performing the same database lookup multiple times and centralizes the handling of missing resources.

#### Controllers

Controllers are responsible for translating HTTP requests into service calls and returning the appropriate HTTP responses.

Business and persistence logic are intentionally kept outside the controllers.

#### Services

The service layer contains application behavior and coordinates persistence operations.

For updates, the service receives the todo entity already loaded by middleware and applies only the fields included in the PATCH request.

#### Repository

The repository encapsulates all TypeORM database access.

This keeps persistence concerns separated from the application logic and provides a clear location for queries, filtering, sorting, and persistence operations.

#### Error Handling

Application errors are handled through centralized Express error middleware.

For example, attempting to access a valid UUID that does not correspond to a todo results in:

```http
404 Not Found
```

Unexpected application errors return:

```http
500 Internal Server Error
```

without exposing internal stack traces to the client.

### Frontend

The frontend is a single-page React application that mirrors the backend's separation of responsibilities:

```text
Component
    ↓
TanStack Query hook
    ↓
API client
    ↓
Express API
```

| Folder        | Responsibility                                                                 |
| ------------- | ------------------------------------------------------------------------------ |
| `types/`      | TypeScript types matching the API contract                                     |
| `api/`        | Thin `fetch` wrappers for each endpoint; non-2xx responses are thrown as errors |
| `hooks/`      | TanStack Query hooks for reading and mutating todos                            |
| `components/` | UI components, which never call `fetch` directly                               |

The component tree is intentionally small:

```text
App                 → owns the current filter and sort selection
├── TodoForm        → creates todos
├── TodoFilters     → changes status, sort field, and sort order
└── TodoList        → renders the list or an empty-state message
    └── TodoItem    → complete / reopen, inline edit, delete
```

#### Server State

The selected filters are part of the query key (`["todos", filters]`), so each filter and sort combination is cached independently.

Every successful create, update, or delete invalidates the `["todos"]` prefix, which refreshes all cached lists so that, for example, a newly completed todo moves out of the "Incomplete" view.

Filtering and sorting are performed by the API rather than in the browser. The UI only passes the selected values as query parameters, keeping a single source of truth for what "overdue" means.

#### Features

- create a todo with a title, optional description, and optional due date
- list todos with loading, error, and filter-aware empty states
- filter by all, completed, incomplete, or overdue
- sort by creation date, due date, or title, ascending or descending
- mark todos as completed or incomplete
- edit a todo inline, including clearing its description or due date
- delete a todo

Buttons are disabled and show progress text while their request is in flight, and failed requests display an error message.

## Data Model

A todo contains:

```text
id
title
description
dueDate
isCompleted
createdAt
updatedAt
```

The main TypeORM entity is backed by PostgreSQL.

`id` is generated as a UUID and `isCompleted` defaults to `false`.

`createdAt` and `updatedAt` are managed automatically by TypeORM.

## API

### Create Todo

```http
POST /todos
```

Example request:

```json
{
  "title": "Finish technical assessment",
  "description": "Complete the Foci Solutions take-home project",
  "dueDate": "2026-10-12"
}
```

Returns:

```http
201 Created
```

### List Todos

```http
GET /todos
```

Optional filtering and sorting are supported.

Examples:

```http
GET /todos?status=completed
GET /todos?status=incomplete
GET /todos?status=overdue

GET /todos?sort=createdAt&order=DESC
GET /todos?sort=dueDate&order=ASC
GET /todos?sort=title&order=ASC
```

Filters and sorting can also be combined:

```http
GET /todos?status=incomplete&sort=dueDate&order=ASC
```

### Get Todo

```http
GET /todos/:id
```

Returns the requested todo or:

```http
404 Not Found
```

if the todo does not exist.

Invalid UUIDs return:

```http
400 Bad Request
```

### Update Todo

```http
PATCH /todos/:id
```

PATCH is used because updates are partial rather than replacing the entire resource.

For example:

```json
{
  "title": "Updated title"
}
```

or:

```json
{
  "isCompleted": true
}
```

Fields not included in the request remain unchanged.

This endpoint also fulfills the complete/incomplete requirements by updating `isCompleted`.

For example:

```json
{
  "isCompleted": true
}
```

marks the task as completed, while:

```json
{
  "isCompleted": false
}
```

marks it as incomplete.

### Delete Todo

```http
DELETE /todos/:id
```

Successful deletion returns:

```http
204 No Content
```

## Validation

Zod is used for runtime request validation while also providing TypeScript types for validated request data.

Validation includes:

- required title
- valid UUID route parameters
- valid ISO date input
- allowed status filters
- allowed sort fields
- allowed sort directions
- preventing empty PATCH requests

Invalid requests return:

```http
400 Bad Request
```

with structured validation information.

## Persistence

Although the assessment allows file-based persistence, PostgreSQL was selected to demonstrate explicit data modeling and durable persistence while remaining easy to run locally through Docker.

TypeORM provides the mapping between application entities and PostgreSQL.

The database is persisted using a Docker volume, meaning application data survives container restarts.

The database implementation is isolated within the repository layer so persistence concerns remain separated from application behavior.

## Running the Application

The application can be run entirely in Docker, or locally with only PostgreSQL in Docker.

### Prerequisites

- Docker
- Docker Compose
- Node.js 22 and npm (for local development only)

### Option 1: Run Everything with Docker

From the repository root:

```bash
docker compose up --build
```

This starts three services:

| Service | Description                        | URL                     |
| ------- | ---------------------------------- | ----------------------- |
| `web`   | Production build of the frontend   | http://localhost:5174   |
| `api`   | Express API                        | http://localhost:3005   |
| `db`    | PostgreSQL                         | `localhost:5434`        |

Open http://localhost:5174 to use the application.

### Option 2: Local Development

Local development runs the API and frontend with hot reloading while PostgreSQL runs in Docker.

#### 1. Install Dependencies

From the repository root:

```bash
npm install
```

#### 2. Start PostgreSQL

```bash
docker compose up -d db
```

PostgreSQL is exposed on:

```text
localhost:5434
```

#### 3. Configure Environment Variables

Create the API environment file:

```text
apps/api/.env
```

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5434/foci_todo
PORT=3005
```

The frontend reads the API location from `VITE_API_URL` and defaults to `http://localhost:3005`, so no frontend configuration is needed when using the values above.

#### 4. Start the API and Frontend

From the repository root, start both applications together:

```bash
npm run dev
```

Or start them individually:

```bash
npm run dev -w apps/api
npm run dev -w apps/web
```

The API will be available at:

```text
http://localhost:3005
```

Health check:

```bash
curl http://localhost:3005/health
```

Vite will print the local frontend URL when it starts (by default http://localhost:5173).

## Running Tests

From the repository root:

```bash
npm run test -w apps/api               # all API tests
npm run test:unit -w apps/api          # unit tests only
npm run test:integration -w apps/api   # integration tests only
```

Tests are organized into:

```text
apps/api/tests/
├── unit/
│   ├── todo.service.test.ts
│   └── fetchTodo.test.ts
└── integration/
    └── todos.api.test.ts
```

No running database is required to execute the test suite.

### Unit Tests

Unit tests cover the service layer and the todo-loading middleware, with the repository replaced by a mock.

They verify:

- creating and listing todos
- partial updates that leave other fields unchanged
- completing and reopening todos
- removing todos
- loading a todo into the request context
- raising a `NotFoundError` when a todo does not exist

The goal is to verify application behavior independently from Express and PostgreSQL.

### Integration Tests

Integration tests use Supertest to send real HTTP requests to the Express application.

Routing, Zod validation, middleware, controllers, the service layer, and centralized error handling all run for real. Only the repository is mocked, which keeps the tests fast and independent of PostgreSQL.

They verify behavior including:

- successful requests and their HTTP status codes
- request body and query parameter validation
- invalid UUID handling
- missing resources (`404`)
- partial updates and completion status changes
- empty PATCH requests (`400`)
- deletion (`204`)
- unexpected errors (`500`) without leaking internal details

Because the repository is mocked, the actual filtering and sorting queries are not exercised by this suite. Testing them against a real PostgreSQL instance is listed under future improvements.

The test suite intentionally focuses on application behavior rather than testing framework or ORM internals.

### Frontend

Automated tests currently cover the API only. Frontend component and end-to-end tests are listed under future improvements.

## Design Decisions

### PostgreSQL Instead of File Persistence

The assignment allows JSON or other file-based persistence.

PostgreSQL was selected because it provides:

- durable persistence
- explicit schema modeling
- realistic application behavior
- straightforward containerized setup

The additional infrastructure remains small because the database can be started using Docker Compose.

### TypeORM

TypeORM was selected because it integrates naturally with TypeScript classes and decorators while keeping the data model easy to inspect.

Database access remains isolated in the repository layer.

### Reusable Feature Structure

The todo feature is intentionally built as a template for future resources rather than as a one-off implementation.

Each feature is composed of small, single-purpose pieces:

```text
schemas      → Zod validation and inferred types
repository   → persistence
service      → application behavior
controller   → HTTP translation
middleware   → loading the requested resource
routes       → collection and individual resource routers
```

Dependencies are passed in through constructors and factory functions (for example, `new TodoService(repository)` and `createFetchTodo(repository)`) rather than created inside each layer. This keeps the pieces loosely coupled and is what allows the tests to replace the repository without any changes to production code.

Cross-cutting concerns are written once and shared:

- `validate(schema, part)` validates any request body, query, or route parameters
- the centralized error handler maps application errors such as `NotFoundError` to HTTP responses

The frontend follows the same idea. The API client, TanStack Query hooks, and components are kept separate, so a new resource gets its own entries in `api/`, `hooks/`, and `components/` without changing the existing todo code.

Adding a new resource, such as projects or tags, means following the same structure instead of introducing new patterns.

### PATCH Instead of PUT

Todo updates use `PATCH /todos/:id`.

The application supports partial updates, so requiring a complete representation of the todo for every modification would not accurately represent the behavior of the endpoint.

This also allows the same endpoint to support both general updates and completion-status changes.

### TanStack Query

The frontend uses TanStack Query to manage server state.

This avoids manually duplicating API data in React state and provides a clear mechanism for fetching, caching, mutations, loading states, errors, and refreshing todo data after modifications.

### Lightweight Monorepo

The frontend and backend live in the same repository and are managed through npm workspaces.

No additional monorepo framework such as Lerna, Nx, or Turborepo was introduced because the project is small enough that npm workspaces provide the required functionality without additional complexity.

## AI-Assisted Development

The assignment explicitly permits the use of generative AI development tools.

AI-assisted tooling was used as part of the development workflow, particularly to accelerate automated test implementation.

Testing scope, architecture constraints, required scenarios, and boundaries for AI-generated changes are documented in:

```text
CLAUDE.md
```

Generated code and tests were reviewed against the application architecture and requirements before inclusion.

AI tooling was treated as a development productivity tool rather than a replacement for design decisions or code ownership.

## Assumptions

- Authentication and multi-user support are outside the scope of the assessment.
- Todos belong to a single application-level collection.
- A todo can be completed or made incomplete by updating `isCompleted`.
- An overdue todo is an incomplete todo whose due date is earlier than the current date.
- Sorting defaults to creation date in descending order.
- The application runs in a single development environment.

## Trade-offs

The implementation intentionally prioritizes:

- readability
- separation of responsibilities
- validation
- testability
- maintainability

over additional features or UI complexity.

The frontend uses plain CSS and a single view, without a component library or client-side router, because the application has one screen and a small number of components.

Features such as authentication, pagination, user accounts, categories, tags, and production deployment infrastructure were intentionally excluded because they are outside the scope of the exercise.

## Future Improvements

Given additional time, possible improvements could include:

- database migrations instead of development-time schema synchronization
- pagination
- repository tests against a real PostgreSQL instance to cover filtering and sorting queries
- frontend component tests
- end-to-end browser testing
- showing the API's field-level validation messages in the UI instead of generic error text
- optimistic UI updates
- user authentication
- CI validation for linting, tests, and builds
- production deployment configuration, such as serving the frontend from a static web server instead of `vite preview`
