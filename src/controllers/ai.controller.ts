import type { Request, Response, NextFunction } from "express";
import { getAICoachResponse } from "../services/ai.service.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/http.js";
import prisma from "../config/db.js";

type Message = { role: "user" | "assistant"; content: string };

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const [profile, recentWorkouts, existingSession] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.workout.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { name: true, exercises: true, createdAt: true },
      }),
      prisma.aIChatSession.findUnique({ where: { userId } }),
    ]);

    if (!profile) {
      sendError(res, "Please complete your profile before using the AI coach", HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const { message } = req.body;
    const history: Message[] = (existingSession?.messages as Message[]) ?? [];

    const { reply, parsed } = await getAICoachResponse(
      message,
      profile.fitnessGoal,
      { age: profile.age, weight: profile.weight, weightUnit: profile.weightUnit, height: profile.height },
      history,
      recentWorkouts
    );

    const updatedMessages: Message[] = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ];

    await prisma.aIChatSession.upsert({
      where: { userId },
      update: { messages: updatedMessages },
      create: { userId, messages: updatedMessages },
    });

    sendSuccess(res, { reply, parsed, goal: profile.fitnessGoal });
  } catch (err) {
    next(err);
  }
};

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.aIChatSession.findUnique({ where: { userId: req.userId! } });
    sendSuccess(res, { messages: (session?.messages as Message[]) ?? [] });
  } catch (err) {
    next(err);
  }
};
