import { useState, type ChangeEvent, type SyntheticEvent } from "react";

import { useCreateTodo } from "../hooks/useTodos";

const initialTodo = {
  title: "",
  description: "",
  dueDate: "",
};

export const TodoForm = () => {
  const [todo, setTodo] = useState(initialTodo);

  const createTodo = useCreateTodo();

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setTodo((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!todo.title.trim()) {
      return;
    }

    await createTodo.mutateAsync({
      title: todo.title.trim(),
      description: todo.description.trim() || undefined,
      dueDate: todo.dueDate || undefined,
    });

    setTodo(initialTodo);
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Task title"
            value={todo.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="dueDate">Due date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={todo.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Description (optional)"
          value={todo.description}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={createTodo.isPending}>
        {createTodo.isPending ? "Creating..." : "Add task"}
      </button>

      {createTodo.isError && <p className="error">Unable to create todo.</p>}
    </form>
  );
};
