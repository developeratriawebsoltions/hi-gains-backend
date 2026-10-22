import type { FitnessGoal } from "@prisma/client";
import { getAICoachResponse } from "./ai.service.js";
import { findExerciseVideo } from "./videoLibrary.service.js";

type UserContext = {
  userId: string;
  fitnessGoal: FitnessGoal;
  profile: { age: number; weight: number; weightUnit: string; height: number };
  recentWorkouts: { name: string; exercises: unknown; createdAt: Date }[];
  conversationHistory: { role: "user" | "assistant"; content: string }[];
};

export type OrchestratorResult = {
  reply: string;
  videoUrl: string | null;
  captions: string | null;
  tips: string[];
};

export const orchestrate = async (
  message: string,
  ctx: UserContext
): Promise<OrchestratorResult> => {

  // Step 1: Parse message with AI
  const { reply, parsed } = await getAICoachResponse(
    message,
    ctx.fitnessGoal,
    ctx.profile,
    ctx.conversationHistory,
    ctx.recentWorkouts
  );

  // Step 2: Search video library
  const video = await findExerciseVideo(parsed);

  let videoUrl: string | null = null;
  let captions: string | null = null;

  if (video) {
    videoUrl = video.videoUrl;
    captions = video.captions ?? null;
  }
  // Step 3b: No video found - Phase 3b (video generation) not yet implemented
  // videoUrl stays null, frontend shows text-only response

  return { reply, videoUrl, captions, tips: extractTips(reply) };
};

function extractTips(reply: string): string[] {
  const lines = reply.split("\n").filter((l) => /^[-\d.]/.test(l.trim()));
  return lines.slice(0, 4).map((l) => l.replace(/^[-\d.]\s*/, "").trim());
}
