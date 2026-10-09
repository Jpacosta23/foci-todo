import { useState } from "react";

import { TodoFilters } from "./components/TodoFilters";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";
import type { TodoQuery } from "./types/todo";

function App() {
  const [filters, setFilters] = useState<TodoQuery>({
    sort: "createdAt",
    order: "DESC",
  });

  const { data: todos = [], isLoading, isError } = useTodos(filters);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Todo List</h1>
        <p>Keep track of tasks and deadlines.</p>
      </header>

      <section className="card">
        <TodoForm />
      </section>

      <section className="card">
        <div className="section-header">
          <h2 className="section-title">Tasks</h2>

          <TodoFilters filters={filters} onChange={setFilters} />
        </div>

        {isLoading && <p className="message">Loading todos...</p>}

        {isError && <p className="error">Unable to load todos.</p>}

        {!isLoading && !isError && (
          <TodoList todos={todos} status={filters.status} />
        )}
      </section>
    </main>
  );
}

export default App;
