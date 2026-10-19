import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { HTTP_STATUS, MESSAGES } from "../constants/http.js";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
};
