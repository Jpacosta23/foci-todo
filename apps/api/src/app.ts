import express from "express";
import cors from "cors";
import { todosRouter } from "./routes/todos.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/todos", todosRouter);

app.use(errorHandler);
