import {z} from 'zod';

// 1. Define the validator schema
const addressSchema = z.object({
  city: z.string(),
  zip: z.string(),
});
const authSchemaObject= z.object({
    id:z.string().uuid(),//string type, primary id using uuid
    name: z.string().min(3), //string type, atleast 3 chars
    email:z.email(),
    password:z.string(),

    age:z.number().int().positive().optional(),
    title: z.string().optional(), //string type, optional
    isAdmin: z.boolean().optional(),
    // integer type, parsed to number,if string number like "8" accepted, rerurn error otherwise, min & max value speicied, can be optional
    rating: z.coerce.number().int("Rating must be an integer").min(1,"Rating must be b/n 1 & 10").max(10,"Rating must be b/n 1 & 10").optional(),
    // enum ttpe with known distnic value, if not retutn error
    gender:z.enum(["M","F"],{error:()=>({message:"geneder must be one of M or F"})}).optional(),
    address: addressSchema.optional(), //Nested validation(object)
    emails: z.array(z.string()).optional(), //array of strings,
})

// 2. Extract the TypeScript type automatically
type auth = z.infer<typeof authSchemaObject>;

// Automatically strips the 'id' field for registration inputs
export const authSchema = authSchemaObject.omit({ id: true });
  
