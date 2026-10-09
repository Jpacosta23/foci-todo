import { LessThan, type FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../config/dataSource.js";
import { TODO_STATUS } from "../constants/todo.constants.js";
import { Todo } from "../entities/todo.entity.js";
import type { CreateTodoInput, TodoQuery } from "../todos/todo.types.js";

export class TodoRepository {
  private readonly repository = AppDataSource.getRepository(Todo);

  private getStatusFilter(status: TodoQuery["status"]): FindOptionsWhere<Todo> {
    switch (status) {
      case TODO_STATUS.COMPLETED:
        return { isCompleted: true };

      case TODO_STATUS.INCOMPLETE:
        return { isCompleted: false };

      case TODO_STATUS.OVERDUE:
        return {
          isCompleted: false,
          dueDate: LessThan(new Date().toISOString().split("T")[0]),
        };

      default:
        return {};
    }
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const todo = this.repository.create({
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
    });

    return this.repository.save(todo);
  }

  async findAll(query: TodoQuery): Promise<Todo[]> {
    const { status, sort, order } = query;

    return this.repository.find({
      where: this.getStatusFilter(status),
      order: {
        [sort]: order,
      },
    });
  }

  async findById(id: string): Promise<Todo | null> {
    return this.repository.findOneBy({ id });
  }

  async save(todo: Todo): Promise<Todo> {
    return this.repository.save(todo);
  }

  async remove(todo: Todo): Promise<Todo> {
    return this.repository.remove(todo);
  }
}
