import { email, z } from "zod";
//validation schema example with common types and validation
/*
// validator schema that will be nested as type for object types
const addressSchema = z.object({
  city: z.string(),
  zip: z.string(),
});

export const exampleSchema = z.object({
//common types and validations
  userName: z.string().min(2,{message:"must be atleast 2 chars"}),
  title: z.string().optional(), //string type, optional
  email: z.email(),
  age: z.number().int().positive().optional(), //integer and optional
  isAdmin: z.boolean().optional(),
  // integer type, parsed to number,if string number like "8" accepted, rerurn error otherwise, min & max value speicied, can be optional
  rating: z.coerce .number().int("Rating must be an integer").min(1, "Rating must be b/n 1 & 10") .max(10, "Rating must be b/n 1 & 10") .optional(),
  // enum type with known distnic value, if not retutn error
  gender: z .enum(["M", "F"], { error: () => ({ message: "geneder must be one of M or F" }),}) .optional(),
  tags: z.array(z.string()).optional(), //array of strings,
  address: addressSchema.optional(), //Nested validation(object)
});
*/
// Separate Login Schema (Keep it simple!)
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Do not add complexity constraints here
});

// 2. Separate Registration Schema (Keep your strict rules here)
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." }),
    email: z.email({ message: "Provide a valid email address." }),
    role: z
      .enum(["BASIC", "AUTHOR", "REVIEWER", "EDITOR", "ADMIN"], {
        error: () => ({
          message: "Role must be either BASIC,AUTHOR,REVIEWER,EDITOR or ADMIN",
        }),
      })
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter,special charcters and numbers",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
