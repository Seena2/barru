import {z} from 'zod';

const userProfileSchema = z.object({
  id: z.string().uuid(),
  // userId: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  birthDate: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE"], {
    error: () => ({ message: "Gender must be either MALE or FEMALE" }),
  }),
  isMarried: z.boolean(),
  nationality: z.string(),
  profileImage: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  emails: z.array(z.string().email()).optional().nullable(), //array of strings,
  pobox: z.string().optional().nullable(),
  telephone: z.array(z.string()),
  institution: z.string().optional().nullable(),
  city: z.string(),
  country: z.string(),
  isMember: z.boolean(),
});
// 2. Extract the TypeScript type automatically
type User = z.infer<typeof userProfileSchema>;
// Automatically strips the 'id' field for registration inputs
export const profileSchema = userProfileSchema.omit({ id: true });