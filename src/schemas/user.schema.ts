import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  age: z.number().int().min(10).max(100),
  weight: z.number().positive(),
  weightUnit: z.enum(["KG", "LBS"]).default("KG"),
  height: z.number().positive(),
  heightUnit: z.enum(["CM", "FT"]).default("CM"),
  fitnessGoal: z.enum(["LOSE_WEIGHT", "BUILD_MUSCLE", "MAINTAIN", "IMPROVE_ENDURANCE"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
