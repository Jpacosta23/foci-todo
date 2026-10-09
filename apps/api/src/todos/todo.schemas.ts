import { z } from "zod";
import {
  SORT_ORDER,
  TODO_SORT,
  TODO_STATUS,
} from "../constants/todo.constants.js";

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().optional(),
  dueDate: z.iso.date().optional(),
});

export const todoIdSchema = z.object({
  id: z.uuid(),
});

export const todoQuerySchema = z.object({
  status: z
    .enum([TODO_STATUS.COMPLETED, TODO_STATUS.INCOMPLETE, TODO_STATUS.OVERDUE])
    .optional(),

  sort: z
    .enum([TODO_SORT.DUE_DATE, TODO_SORT.CREATED_AT, TODO_SORT.TITLE])
    .default(TODO_SORT.CREATED_AT),

  order: z.enum([SORT_ORDER.ASC, SORT_ORDER.DESC]).default(SORT_ORDER.DESC),
});

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().nullable().optional(),
    dueDate: z.iso.date().nullable().optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );
