import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "../../src/app.js";
import type { Todo } from "../../src/entities/todo.entity.js";

// The repository is the only boundary replaced: routing, validation, controller,
// service and error handling all run for real, without needing a database.
const repository = vi.hoisted(() => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../src/repositories/todo.repository.js", () => ({
  TodoRepository: class {
    constructor() {
      return repository;
    }
  },
}));

const TODO_ID = "8b0f9a7e-3c1d-4f2a-9b6e-1a2b3c4d5e6f";

const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: TODO_ID,
  title: "Buy milk",
  description: null,
  dueDate: null,
  isCompleted: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("Todos API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("POST /todos", () => {
    it("returns 201 with the created todo", async () => {
      repository.create.mockResolvedValue(
        buildTodo({ description: "2 litres", dueDate: "2026-02-01" }),
      );

      const response = await request(app)
        .post("/todos")
        .send({ title: "Buy milk", description: "2 litres", dueDate: "2026-02-01" });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: TODO_ID,
        title: "Buy milk",
        description: "2 litres",
        dueDate: "2026-02-01",
        isCompleted: false,
      });
    });

    it("returns 400 when the title is missing", async () => {
      const response = await request(app).post("/todos").send({ description: "No title" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toHaveProperty("title");
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("returns 400 when the due date is not an ISO date", async () => {
      const response = await request(app)
        .post("/todos")
        .send({ title: "Buy milk", dueDate: "tomorrow" });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveProperty("dueDate");
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /todos", () => {
    it("returns 200 with the todo list and applies query defaults", async () => {
      repository.findAll.mockResolvedValue([buildTodo()]);

      const response = await request(app).get("/todos");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ id: TODO_ID, title: "Buy milk" });
    });

    it("returns 400 for an unknown status filter", async () => {
      const response = await request(app).get("/todos?status=archived");

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveProperty("status");
      expect(repository.findAll).not.toHaveBeenCalled();
    });
  });

  describe("GET /todos/:id", () => {
    it("returns 200 with the todo", async () => {
      repository.findById.mockResolvedValue(buildTodo());

      const response = await request(app).get(`/todos/${TODO_ID}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: TODO_ID, title: "Buy milk" });
      expect(repository.findById).toHaveBeenCalledWith(TODO_ID);
    });

    it("returns 400 for an invalid UUID", async () => {
      const response = await request(app).get("/todos/not-a-uuid");

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveProperty("id");
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it("returns 404 when the todo does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      const response = await request(app).get(`/todos/${TODO_ID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Todo not found" });
    });
  });

  describe("PATCH /todos/:id", () => {
    it("returns 200 with the updated todo", async () => {
      repository.findById.mockResolvedValue(buildTodo());
      repository.save.mockImplementation(async (todo: Todo) => todo);

      const response = await request(app)
        .patch(`/todos/${TODO_ID}`)
        .send({ isCompleted: true });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: TODO_ID,
        title: "Buy milk",
        isCompleted: true,
      });
    });

    it("returns 400 for an empty body", async () => {
      repository.findById.mockResolvedValue(buildTodo());

      const response = await request(app).patch(`/todos/${TODO_ID}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid UUID", async () => {
      const response = await request(app)
        .patch("/todos/not-a-uuid")
        .send({ title: "Buy oat milk" });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveProperty("id");
    });

    it("returns 404 when the todo does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/todos/${TODO_ID}`)
        .send({ title: "Buy oat milk" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Todo not found" });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /todos/:id", () => {
    it("returns 204 with an empty body", async () => {
      const todo = buildTodo();
      repository.findById.mockResolvedValue(todo);
      repository.remove.mockResolvedValue(todo);

      const response = await request(app).delete(`/todos/${TODO_ID}`);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
      expect(repository.remove).toHaveBeenCalledWith(todo);
    });

    it("returns 400 for an invalid UUID", async () => {
      const response = await request(app).delete("/todos/not-a-uuid");

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveProperty("id");
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it("returns 404 when the todo does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      const response = await request(app).delete(`/todos/${TODO_ID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Todo not found" });
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe("unexpected errors", () => {
    it("returns 500 without leaking error details", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      repository.findAll.mockRejectedValue(new Error("connection refused"));

      const response = await request(app).get("/todos");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal server error" });
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
