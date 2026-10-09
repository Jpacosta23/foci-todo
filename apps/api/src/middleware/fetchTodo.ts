// middleware/fetchTodo.ts

import type { NextFunction, Request, Response } from "express";

import { NotFoundError } from "../errors/notFoundError.js";
import { TodoRepository } from "../repositories/todo.repository.js";
import type { TodoIdParams } from "../todos/todo.types.js";

export const createFetchTodo =
  (repository: TodoRepository) =>
  async (req: Request<TodoIdParams>, res: Response, next: NextFunction): Promise<void> => {
    const todo = await repository.findById(req.params.id);

    if (!todo) {
      throw new NotFoundError("Todo not found");
    }

    res.locals.todo = todo;

    next();
  };
