import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HTTP_STATUS, MESSAGES } from "../constants/http.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: MESSAGES.UNAUTHORIZED });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.userId = (decoded as { id: string }).id;
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: MESSAGES.UNAUTHORIZED });
  }
};
