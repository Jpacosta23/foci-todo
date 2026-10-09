export type Todo = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTodoInput = {
  title: string;
  description?: string;
  dueDate?: string;
};

export type UpdateTodoInput = Partial<
  Pick<Todo, "title" | "description" | "dueDate" | "isCompleted">
>;

export type TodoStatus = "completed" | "incomplete" | "overdue";
export type TodoSort = "createdAt" | "dueDate" | "title";
export type SortOrder = "ASC" | "DESC";

export type TodoQuery = {
  status?: TodoStatus;
  sort?: TodoSort;
  order?: SortOrder;
};
