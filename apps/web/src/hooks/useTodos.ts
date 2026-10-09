import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTodo, deleteTodo, getTodos, updateTodo } from "../api/todos.api";
import type { TodoQuery, UpdateTodoInput } from "../types/todo";

export const TODO_QUERY_KEY = ["todos"] as const;

export const useTodos = (query: TodoQuery) =>
  useQuery({
    queryKey: [...TODO_QUERY_KEY, query],
    queryFn: () => getTodos(query),
  });

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TODO_QUERY_KEY,
      });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      updateTodo(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TODO_QUERY_KEY,
      });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TODO_QUERY_KEY,
      });
    },
  });
};
