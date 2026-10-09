export const TODO_STATUS = {
  COMPLETED: "completed",
  INCOMPLETE: "incomplete",
  OVERDUE: "overdue",
} as const;

export const TODO_SORT = {
  DUE_DATE: "dueDate",
  CREATED_AT: "createdAt",
  TITLE: "title",
} as const;

export const SORT_ORDER = {
  ASC: "ASC",
  DESC: "DESC",
} as const;
