import Groq from "groq-sdk";
import { env } from "../config/env.js";
import type { FitnessGoal } from "@prisma/client";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const goalPrompts: Record<FitnessGoal, string> = {
  LOSE_WEIGHT:
    "The user's goal is weight loss. Recommend high-rep, low-rest exercises, cardio combinations, and calorie-burning workouts.",
  BUILD_MUSCLE:
    "The user's goal is muscle building. Recommend compound lifts, progressive overload, 4-6 sets of 6-12 reps, and adequate rest.",
  MAINTAIN:
    "The user's goal is to maintain fitness. Recommend balanced workouts mixing strength and cardio.",
  IMPROVE_ENDURANCE:
    "The user's goal is improving endurance. Recommend circuit training, high reps (15+), minimal rest periods.",
};

export type ParsedExercise = {
  exercise: string | null;
  variation: string | null;
  equipment: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  cameraAngle: "front" | "side" | "top" | null;
};

export type AICoachResponse = {
  reply: string;
  parsed: ParsedExercise;
};

export const getAICoachResponse = async (
  message: string,
  fitnessGoal: FitnessGoal,
  userProfile: { age: number; weight: number; weightUnit: string; height: number },
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  recentWorkouts: { name: string; exercises: unknown; createdAt: Date }[]
): Promise<AICoachResponse> => {
  const workoutContext =
    recentWorkouts.length > 0
      ? `\nRecent Workouts (last ${recentWorkouts.length}):\n` +
        recentWorkouts
          .map((w) => `- ${w.name} on ${w.createdAt.toDateString()}: ${JSON.stringify(w.exercises)}`)
          .join("\n")
      : "\nNo workout history yet.";

  const systemPrompt = `You are a personal AI fitness coach inside the Hi-Gains fitness app.

User Profile:
- Age: ${userProfile.age}
- Weight: ${userProfile.weight} ${userProfile.weightUnit}
- Height: ${userProfile.height}

Fitness Goal: ${fitnessGoal.replace("_", " ")}
${goalPrompts[fitnessGoal]}
${workoutContext}

Guidelines:
- Give specific, actionable advice based on the user's goal and workout history
- Avoid recommending muscle groups the user already trained recently
- Keep responses concise and motivating
- If asked about an exercise, include: sets, reps, rest time, and form tips

You MUST respond with a valid JSON object in this exact format:
{
  "reply": "<your coaching response here>",
  "parsed": {
    "exercise": "<exercise name or null if not mentioned>",
    "variation": "<variation like standard/wide grip/etc or null>",
    "equipment": "<equipment like dumbbells/barbell/bodyweight or null>",
    "difficulty": "<beginner|intermediate|advanced or null>",
    "cameraAngle": "<front|side|top or null>"
  }
}`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: message },
  ];

  const response = await groq.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    messages,
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as AICoachResponse;
    return {
      reply: parsed.reply ?? "Sorry, I could not process your request.",
      parsed: parsed.parsed ?? {
        exercise: null,
        variation: null,
        equipment: null,
        difficulty: null,
        cameraAngle: null,
      },
    };
  } catch {
    return {
      reply: raw,
      parsed: { exercise: null, variation: null, equipment: null, difficulty: null, cameraAngle: null },
    };
  }
};
