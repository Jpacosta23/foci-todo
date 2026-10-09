import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Todo } from "../../src/entities/todo.entity.js";
import type { TodoRepository } from "../../src/repositories/todo.repository.js";
import { TodoService } from "../../src/todos/todo.service.js";

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

describe("TodoService", () => {
  const repository = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  let service: TodoService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new TodoService(repository as unknown as TodoRepository);
  });

  describe("create", () => {
    it("creates a todo through the repository", async () => {
      const input = { title: "Buy milk", dueDate: "2026-02-01" };
      const created = buildTodo({ dueDate: "2026-02-01" });
      repository.create.mockResolvedValue(created);

      await expect(service.create(input)).resolves.toEqual(created);
      expect(repository.create).toHaveBeenCalledWith(input);
    });
  });

  describe("getTodos", () => {
    it("returns all todos matching the query", async () => {
      const query = { sort: "createdAt", order: "DESC" } as const;
      const todos = [buildTodo(), buildTodo({ id: "other-id", title: "Walk dog" })];
      repository.findAll.mockResolvedValue(todos);

      await expect(service.getTodos(query)).resolves.toEqual(todos);
      expect(repository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("updateTodo", () => {
    beforeEach(() => {
      repository.save.mockImplementation(async (todo: Todo) => todo);
    });

    it("updates only the provided fields", async () => {
      const todo = buildTodo({ description: "2 litres", dueDate: "2026-02-01" });

      const result = await service.updateTodo(todo, { title: "Buy oat milk" });

      expect(result).toMatchObject({
        title: "Buy oat milk",
        description: "2 litres",
        dueDate: "2026-02-01",
        isCompleted: false,
      });
      expect(repository.save).toHaveBeenCalledWith(todo);
    });

    it("marks a todo as completed", async () => {
      const result = await service.updateTodo(buildTodo({ isCompleted: false }), {
        isCompleted: true,
      });

      expect(result.isCompleted).toBe(true);
    });

    it("marks a todo as incomplete", async () => {
      const result = await service.updateTodo(buildTodo({ isCompleted: true }), {
        isCompleted: false,
      });

      expect(result.isCompleted).toBe(false);
    });
  });

  describe("deleteTodo", () => {
    it("removes the todo through the repository", async () => {
      const todo = buildTodo();
      repository.remove.mockResolvedValue(todo);

      await expect(service.deleteTodo(todo)).resolves.toBeUndefined();
      expect(repository.remove).toHaveBeenCalledWith(todo);
    });
  });
});
