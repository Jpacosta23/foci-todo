import type { Todo, TodoStatus } from "../types/todo";
import { TodoItem } from "./TodoItem";

type Props = {
  todos: Todo[];
  status?: TodoStatus;
};

const getEmptyMessage = (status?: TodoStatus) => {
  switch (status) {
    case "completed":
      return "No completed tasks.";

    case "incomplete":
      return "No pending tasks.";

    case "overdue":
      return "No overdue tasks.";

    default:
      return "No tasks yet.";
  }
};

export const TodoList = ({ todos, status }: Props) => {
  if (todos.length === 0) {
    return <p className="message">{getEmptyMessage(status)}</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
};
