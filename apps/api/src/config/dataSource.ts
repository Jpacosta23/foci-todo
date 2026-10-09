import "reflect-metadata";
import { DataSource } from "typeorm";
import { Todo } from "../entities/todo.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Todo],
  synchronize: true,
  logging: false,
});
