import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Define the helper function which takes a Zod schema
export const validateRequest = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body against the schema
      const result = schema.safeParse(req.body);
      if (!result.success) {
        // Loop through issues to find fields that received 'undefined'
        const missingFields = result.error.issues
          .filter((issue) => issue.input === undefined)
          .map((issue) => issue.path.join("."));
        console.log("Missing fields detected:", missingFields);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the validation errors into a clean, readable object
        // console.log(error.issues);
        /*const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
           return res.status(400).json({ success: false, errors: errorMessages });
        }));
        */
        const missing = error.issues
          .filter((iss) => iss.input === undefined)
          .map((iss) => iss.path.join("."));
        return res.status(400).json({
          message: "Missing required fields",
          fields: missing, // Sends array of missing keys like ['email']
        });
      }
      //

      // Pass any unexpected errors to the global error handler
      next(error);
    }
  };
};
