import type { NextFunction, Request, Response } from "express";

import { NotFoundError } from "../errors/notFoundError.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof NotFoundError) {
    res.status(404).json({
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
};
