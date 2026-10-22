import prisma from "../config/db.js";
import type { ParsedExercise } from "./ai.service.js";

export const findExerciseVideo = async (parsed: ParsedExercise) => {
  if (!parsed.exercise) return null;

  return prisma.exerciseVideo.findFirst({
    where: {
      exercise: { contains: parsed.exercise },
      ...(parsed.equipment && { equipment: parsed.equipment }),
      ...(parsed.variation && { variation: parsed.variation }),
      ...(parsed.difficulty && { difficulty: parsed.difficulty }),
      ...(parsed.cameraAngle && { cameraAngle: parsed.cameraAngle }),
      isApproved: true,
    },
  });
};
