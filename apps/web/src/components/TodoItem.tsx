import { useState } from "react";

import { useDeleteTodo, useUpdateTodo } from "../hooks/useTodos";
import type { Todo } from "../types/todo";

type Props = {
  todo: Todo;
};

export const TodoItem = ({ todo }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [todoForm, setTodoForm] = useState({
    title: todo.title,
    description: todo.description ?? "",
    dueDate: todo.dueDate ?? "",
  });

  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setTodoForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleCompleted = () => {
    updateTodo.mutate({
      id: todo.id,
      input: {
        isCompleted: !todo.isCompleted,
      },
    });
  };

  const handleSave = async () => {
    if (!todoForm.title.trim()) {
      return;
    }

    await updateTodo.mutateAsync({
      id: todo.id,
      input: {
        title: todoForm.title.trim(),
        description: todoForm.description.trim() || null,
        dueDate: todoForm.dueDate || null,
      },
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setTodoForm({
      title: todo.title,
      description: todo.description ?? "",
      dueDate: todo.dueDate ?? "",
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo.id);
  };

  if (isEditing) {
    return (
      <li className="card todo-item">
        <div className="todo-edit">
          <div className="form-field">
            <label htmlFor={`title-${todo.id}`}>Title</label>
            <input
              id={`title-${todo.id}`}
              name="title"
              type="text"
              value={todoForm.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`description-${todo.id}`}>Description</label>
            <textarea
              id={`description-${todo.id}`}
              name="description"
              value={todoForm.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`dueDate-${todo.id}`}>Due date</label>
            <input
              id={`dueDate-${todo.id}`}
              name="dueDate"
              type="date"
              value={todoForm.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="todo-actions">
            <button
              type="button"
              onClick={handleSave}
              disabled={updateTodo.isPending}
            >
              {updateTodo.isPending ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={updateTodo.isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="card todo-item">
      <div className="todo-content">
        <h3 className="todo-title">{todo.title}</h3>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          {todo.dueDate && <span>Due: {todo.dueDate}</span>}

          <span className="status">
            {todo.isCompleted ? "Completed" : "Incomplete"}
          </span>
        </div>
      </div>

      <div className="todo-actions">
        <button
          type="button"
          onClick={toggleCompleted}
          disabled={updateTodo.isPending}
        >
          {todo.isCompleted ? "Mark incomplete" : "Complete"}
        </button>

        <button type="button" onClick={() => setIsEditing(true)}>
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteTodo.isPending}
        >
          {deleteTodo.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </li>
  );
};
