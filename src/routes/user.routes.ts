import { Router } from "express";
import { register, login, saveProfile, getProfile } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { registerSchema, loginSchema, profileSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/profile", authenticate, validate(profileSchema), saveProfile);
router.get("/profile", authenticate, getProfile);

export default router;
