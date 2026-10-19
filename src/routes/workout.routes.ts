import { Router } from "express";
import { createWorkout, getAllWorkouts, getWorkout } from "../controllers/workout.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { createWorkoutSchema } from "../schemas/workout.schema.js";

const router = Router();

router.post("/", authenticate, validate(createWorkoutSchema), createWorkout);
router.get("/", authenticate, getAllWorkouts);
router.get("/:id", authenticate, getWorkout);

export default router;
