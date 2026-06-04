import type{ Request, Response, NextFunction } from 'express';
import type{ z, ZodSchema } from 'zod';

// helper function that accepts generic schema <T extends z.ZodTypeAny> to safely capture the exact schema type
export const validateRequest = <T extends ZodSchema>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //	Checks if the  request body matches the schema  requirement
    const result= schema.safeParse(req.body);
    if(!result.success){
        const errorMessage= result.error.issues.map((issue)=>issue.message)
        const allErrors=errorMessage.join(", ");
        return res.status(400).json({message:allErrors})
    }
    next();
};
}
//
