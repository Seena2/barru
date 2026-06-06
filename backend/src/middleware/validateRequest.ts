import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import type { ZodSchema } from "zod/v3";

// Define the helper function which takes a Zod schema
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //1. Parse and validate the request body(or params/query) against the schema
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // 3. Format errors by field using Zod's flatten method
      const fieldErrors = result.error.flatten().fieldErrors;

      // 4. Return the field-specific errors with a 400 Bad Request
      res.status(400).json({
        success: false,
        errors: fieldErrors,
      });
      return;
    }
    // 5. Replace req.body with parsed/coerced data for downstream handlers
    req.body = result.data;
    next();
  };
};