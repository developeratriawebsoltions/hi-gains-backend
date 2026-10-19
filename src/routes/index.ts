import { Router } from "express";
import type { Request, Response } from "express";
import userRoutes from "./user.routes.js";
import workoutRoutes from "./workout.routes.js";
import aiRoutes from "./ai.routes.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/users", userRoutes);
router.use("/workouts", workoutRoutes);
router.use("/ai", aiRoutes);

export default router;
