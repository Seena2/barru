import {z} from 'zod';

const commentSchema=z.object({
    role: z.enum(["BASIC", "AUTHOR",  "REVIEWER", "EDITOR", "ADMIN"],{error: ()=>({message:"Status must either BASIC,AUTHOR,REVIEWER,EDITOR or ADMIN"})}),
    date:z.date(),
    comment:z.string(),
})

const reviewSchemaObject = z.object({
    id: z.string().uuid(),
    reviewerId: z.string().uuid(),
    articleId: z.string().uuid(),
    comments: commentSchema.optional()
})

// 2. Extract the TypeScript type automatically
   type review = z.infer<typeof reviewSchemaObject>;
   // Automatically strips the 'id' field for registration inputs
   export const reviewSchema = reviewSchemaObject.omit({ id: true });