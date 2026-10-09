import type { ChangeEvent } from "react";

import type { SortOrder, TodoQuery, TodoSort, TodoStatus } from "../types/todo";

type Props = {
  filters: TodoQuery;
  onChange: (filters: TodoQuery) => void;
};

export const TodoFilters = ({ filters, onChange }: Props) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    onChange({
      ...filters,
      [name]: value || undefined,
    });
  };

  return (
    <div className="todo-filters">
      <div className="form-field">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={filters.status ?? ""}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value={"completed" satisfies TodoStatus}>Completed</option>
          <option value={"incomplete" satisfies TodoStatus}>Incomplete</option>
          <option value={"overdue" satisfies TodoStatus}>Overdue</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="sort">Sort by</label>
        <select
          id="sort"
          name="sort"
          value={filters.sort ?? "createdAt"}
          onChange={handleChange}
        >
          <option value={"createdAt" satisfies TodoSort}>Created</option>
          <option value={"dueDate" satisfies TodoSort}>Due date</option>
          <option value={"title" satisfies TodoSort}>Title</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="order">Order</label>
        <select
          id="order"
          name="order"
          value={filters.order ?? "DESC"}
          onChange={handleChange}
        >
          <option value={"DESC" satisfies SortOrder}>Descending</option>
          <option value={"ASC" satisfies SortOrder}>Ascending</option>
        </select>
      </div>
    </div>
  );
};
