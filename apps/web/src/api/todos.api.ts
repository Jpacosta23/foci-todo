import type {
  CreateTodoInput,
  Todo,
  TodoQuery,
  UpdateTodoInput,
} from "../types/todo";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3005";

export const getTodos = async (query: TodoQuery = {}): Promise<Todo[]> => {
  const searchParams = new URLSearchParams();

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.sort) {
    searchParams.set("sort", query.sort);
  }

  if (query.order) {
    searchParams.set("order", query.order);
  }

  const queryString = searchParams.toString();

  const response = await fetch(
    `${API_URL}/todos${queryString ? `?${queryString}` : ""}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  return response.json();
};

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  const response = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create todo");
  }

  return response.json();
};

export const updateTodo = async (
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> => {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update todo");
  }

  return response.json();
};

export const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo");
  }
};
