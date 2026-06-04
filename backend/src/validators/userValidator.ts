import {z} from 'zod';

const userProfileSchema = z.object({
   id: z.string().uuid(),
   userId: z.string().uuid(),
   firstName: z.string(),
   middleName: z.string(),
   lastName: z.string(),
   birthDate: z.date(),
   gender: z.enum([" MALE","FEMALE"], {error: ()=>({message:"Status must either MALE or FEMALE"})}),
   isMarried: z.boolean(),
   nationality: z.string(),
   profileImage: z.string().optional(),
   bio: z.string().optional(),
   emails: z.array(z.string()).optional(), //array of strings,
   pobox: z.string().optional(),
   telephone:z.array(z.string()),
   institution: z.string().optional(),
   city:z.string(),
   country: z.string(),
   isMember: z.boolean(),
   role: z.enum(["BASIC", "AUTHOR",  "REVIEWER", "EDITOR", "ADMIN"],{error: ()=>({message:"Status must either BASIC,AUTHOR,REVIEWER,EDITOR or ADMIN"})}),
})
// 2. Extract the TypeScript type automatically
type user = z.infer<typeof userProfileSchema>;
// Automatically strips the 'id' field for registration inputs
export const profileSchema = userProfileSchema.omit({ id: true });