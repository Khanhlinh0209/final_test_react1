import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email is not valid."),
  password: z.string().trim().min(6, "Password must be at least 6 characters."),
});
