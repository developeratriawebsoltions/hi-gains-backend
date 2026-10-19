import prisma from "../config/db.js";
import type { CreateWorkoutInput } from "../schemas/workout.schema.js";

export const createWorkout = (userId: string, data: CreateWorkoutInput) =>
  prisma.workout.create({
    data: { userId, name: data.name, exercises: data.exercises },
  });

export const getUserWorkouts = (userId: string) =>
  prisma.workout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

export const getWorkoutById = (userId: string, workoutId: string) =>
  prisma.workout.findFirst({ where: { id: workoutId, userId } });
