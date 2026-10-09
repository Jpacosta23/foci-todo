import type { Request, Response } from "express";

import type { Todo } from "../entities/todo.entity.js";
import { TodoService } from "./todo.service.js";
import type { TodoQuery } from "./todo.types.js";

export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const todo = await this.todoService.create(req.body);

    res.status(201).json(todo);
  };

  getTodos = async (
    req: Request<{}, {}, {}, TodoQuery>,
    res: Response,
  ): Promise<void> => {
    const todos = await this.todoService.getTodos(req.query);

    res.status(200).json(todos);
  };

  getTodo = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(res.locals.todo);
  };

  updateTodo = async (req: Request, res: Response): Promise<void> => {
    const todo = await this.todoService.updateTodo(
      res.locals.todo as Todo,
      req.body,
    );

    res.status(200).json(todo);
  };

  deleteTodo = async (_req: Request, res: Response): Promise<void> => {
    await this.todoService.deleteTodo(res.locals.todo as Todo);

    res.status(204).send();
  };
}
