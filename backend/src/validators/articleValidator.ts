import {z} from 'zod';

const notesSchema=z.object({
    role: z.enum(["BASIC", "AUTHOR",  "REVIEWER", "EDITOR", "ADMIN"],{error: ()=>({message:"Status must either BASIC,AUTHOR,REVIEWER,EDITOR or ADMIN"})}),
    date:z.date(),
    comment:z.string(),
})
const articleSchemaObject = z.object({
  id: z.string().uuid(),
  title: z.string(),
  abstract: z.string().optional(),
  fileUrl: z.string(),
  fileType: z.string(),
  articleType: z.array(z.string()), //array of string,
  pages: z.coerce
    .number()
    .int("pages must be an integer")
    .min(1, "minimum page must be atleast 1 ")
    .max(10, "max page must be alteast 10")
    .optional(),

  submitedFor: z.enum([" PROCEEDINGS", "JOURNAL"], {
    error: () => ({ message: "Status must either PROCEEDINGS or JOURNAL" }),
  }),
  journalType: z.enum([" ORIGINAL", "REVIEW", "  SHORT"], {
    error: () => ({ message: "Status must either ORIGINAL,REVIEW or SHORT" }),
  }),
  status: z.enum(
    [
      " PENDING",
      "REVIEWING",
      "  REJECTED",
      "ACCEPTED",
      "COMPLETED",
      "  PUBLISHED",
    ],
    {
      error: () => ({
        message:
          "Status must either PENDING,REVIEWING, REJECTED, ACCEPTED, COMPLETED or   PUBLISHED",
      }),
    },
  ),
  notes: notesSchema.optional(), //object of type notesSchema
  publishedDate: z.date().optional(),
  isFree: z.boolean().optional(),
});

   // 2. Extract the TypeScript type automatically
   type article = z.infer<typeof articleSchemaObject>;
   // Automatically strips the 'id' field for registration inputs
   export const articleSchema = articleSchemaObject.omit({ id: true });



