import { Router } from "express";

import { TodoController } from "../todos/todo.controller.js";
import { TodoRepository } from "../repositories/todo.repository.js";
import { TodoService } from "../todos/todo.service.js";
import { validate } from "../middleware/validate.js";
import {
  createTodoSchema,
  todoIdSchema,
  todoQuerySchema,
} from "../todos/todo.schemas.js";
import { createTodoRouter } from "./todo.routes.js";
import { createFetchTodo } from "../middleware/fetchTodo.js";

const router = Router();

const repository = new TodoRepository();
const service = new TodoService(repository);
const controller = new TodoController(service);
const fetchTodoMiddleware = createFetchTodo(repository);

router.get("/", validate(todoQuerySchema, "query"), controller.getTodos);

router.post("/", validate(createTodoSchema), controller.create);

router.use(
  "/:id",
  validate(todoIdSchema, "params"),
  fetchTodoMiddleware,
  createTodoRouter(controller),
);

export const todosRouter = router;
