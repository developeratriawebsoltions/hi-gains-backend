import { z } from "zod";

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;
