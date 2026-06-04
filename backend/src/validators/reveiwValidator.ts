import {z} from 'zod';

const commentSchema=z.object({
    role: z.enum(["BASIC", "AUTHOR",  "REVIEWER", "EDITOR", "ADMIN"],{error: ()=>({message:"Status must either BASIC,AUTHOR,REVIEWER,EDITOR or ADMIN"})}),
    date:z.date(),
    comment:z.string(),
})

const reviewSchema = z.object({
    id: z.string().uuid(),
    reviewerId: z.string().uuid(),
    articleId: z.string().uuid(),
    comments: commentSchema.optional()
})

export {reviewSchema}
