import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Todo } from "../../src/entities/todo.entity.js";
import { NotFoundError } from "../../src/errors/notFoundError.js";
import { createFetchTodo } from "../../src/middleware/fetchTodo.js";
import type { TodoRepository } from "../../src/repositories/todo.repository.js";
import type { TodoIdParams } from "../../src/todos/todo.types.js";

const TODO_ID = "8b0f9a7e-3c1d-4f2a-9b6e-1a2b3c4d5e6f";

describe("fetchTodo middleware", () => {
  const repository = { findById: vi.fn() };
  const fetchTodo = createFetchTodo(repository as unknown as TodoRepository);

  let req: Request<TodoIdParams>;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.resetAllMocks();
    req = { params: { id: TODO_ID } } as Request<TodoIdParams>;
    res = { locals: {} } as Response;
    next = vi.fn();
  });

  it("loads the todo into res.locals and calls next", async () => {
    const todo = { id: TODO_ID, title: "Buy milk" } as Todo;
    repository.findById.mockResolvedValue(todo);

    await fetchTodo(req, res, next);

    expect(repository.findById).toHaveBeenCalledWith(TODO_ID);
    expect(res.locals.todo).toBe(todo);
    expect(next).toHaveBeenCalledOnce();
  });

  it("throws NotFoundError when the todo does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(fetchTodo(req, res, next)).rejects.toThrow(NotFoundError);
    expect(next).not.toHaveBeenCalled();
  });
});
