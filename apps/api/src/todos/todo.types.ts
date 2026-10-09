// src/todos/todo.types.ts

import type z from "zod";
import type {
  createTodoSchema,
  todoQuerySchema,
  updateTodoSchema,
} from "./todo.schemas.js";

export type TodoIdParams = {
  id: string;
};

export type TodoQuery = z.infer<typeof todoQuerySchema>;

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
