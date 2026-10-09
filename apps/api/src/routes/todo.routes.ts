import { Router } from "express";

import type { TodoController } from "../todos/todo.controller.js";
import { validate } from "../middleware/validate.js";
import { updateTodoSchema } from "../todos/todo.schemas.js";

export const createTodoRouter = (controller: TodoController) => {
  const router = Router({ mergeParams: true });

  router.get("/", controller.getTodo);

  router.patch("/", validate(updateTodoSchema), controller.updateTodo);

  router.delete("/", controller.deleteTodo);

  return router;
};
