import type { Todo } from "../entities/todo.entity.js";
import { TodoRepository } from "../repositories/todo.repository.js";
import type {
  CreateTodoInput,
  TodoQuery,
  UpdateTodoInput,
} from "./todo.types.js";

export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  create(input: CreateTodoInput) {
    return this.todoRepository.create(input);
  }

  getTodos(query: TodoQuery) {
    return this.todoRepository.findAll(query);
  }

  updateTodo(todo: Todo, input: UpdateTodoInput) {
    Object.assign(todo, input);

    return this.todoRepository.save(todo);
  }

  async deleteTodo(todo: Todo): Promise<void> {
    await this.todoRepository.remove(todo);
  }
}
