import { z } from "zod";

export const createWorkoutSchema = z.object({
  name: z.string().min(3, "Workout name must be at least 3 characters"),
  exercises: z
    .array(
      z.object({
        name: z.string(),
        sets: z.number().int().positive(),
        reps: z.number().int().positive(),
        weight: z.number().positive().optional(),
      })
    )
    .min(1, "At least one exercise is required"),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
