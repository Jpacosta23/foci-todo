import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodType, part: RequestPart = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      res.status(400).json({
        message: "Validation failed",
        errors: errors.fieldErrors,
      });

      return;
    }

    next();
  };
