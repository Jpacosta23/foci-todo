# Testing instructions

Focus only on adding and improving automated tests for the API.

Do not change application architecture, production code, folder structure, API contracts, or dependencies unless strictly required for testability.

## Testing stack

- Vitest
- Supertest for Express API integration tests

## Test location

All API tests must live under:

```text
apps/api/tests/
├── unit/
└── integration/
```

Use:

```text
apps/api/tests/unit/
```

for isolated unit tests such as `TodoService` tests with mocked dependencies.

Use:

```text
apps/api/tests/integration/
```

for Express API tests using Supertest.

Do not place test files inside `src/`.

## Naming

Prefer:

```text
todo.service.test.ts
todo.api.test.ts
```

Keep filenames aligned with the behavior being tested.

## Priorities

1. Unit test `TodoService` using mocked `TodoRepository`.
2. Integration test the Express API endpoints with Supertest.
3. Cover success cases and meaningful failure cases.
4. Keep tests readable and behavior-focused.
5. Avoid excessive mocking.
6. Do not test TypeORM, Express, Zod, or other third-party library internals.
7. Prefer explicit test setup over complex abstractions.

## Required service scenarios

- create todo
- get all todos
- get todo by ID
- throw `NotFoundError` when todo does not exist
- update partial todo fields
- update `isCompleted` to true
- update `isCompleted` to false
- delete todo
- throw `NotFoundError` when delete affects no record

## Required API scenarios

- `POST /todos` returns 201
- invalid POST returns 400
- `GET /todos` returns 200
- query filtering/sorting works
- `GET /todos/:id` returns 200
- invalid UUID returns 400
- missing todo returns 404
- `PATCH /todos/:id` returns 200
- PATCH can update only `isCompleted`
- empty PATCH returns 400
- `DELETE /todos/:id` returns 204
- deleting a missing todo returns 404
- unexpected application errors return 500

## Constraints

Do not:

- change the production architecture
- rename production files or folders
- change API contracts
- replace TypeORM, Zod, Express, or Vitest
- add unnecessary dependencies
- refactor production code unless a very small change is strictly necessary for testability

If a production-code change is needed for testability, explain why before making it.

## Completion criteria

After implementing tests:

- run the full API test suite
- fix only test-related issues
- report which files were added or changed
- summarize coverage by behavior, not just by test count

Do not optimize for number of tests. Optimize for meaningful coverage, maintainability, and readability.
