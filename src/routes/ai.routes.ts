import { Router } from "express";
import { chat, getSession } from "../controllers/ai.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { aiChatSchema } from "../schemas/ai.schema.js";

const router = Router();

router.post("/chat", authenticate, validate(aiChatSchema), chat);
router.get("/sessions", authenticate, getSession);

export default router;
