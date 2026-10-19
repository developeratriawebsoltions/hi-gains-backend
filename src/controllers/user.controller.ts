import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/http.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.register(req.body);
    sendSuccess(res, result, HTTP_STATUS.CREATED);
  } catch (err: any) {
    if (err.message === "Email already in use") {
      sendError(res, err.message, HTTP_STATUS.CONFLICT);
      return;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.login(req.body);
    sendSuccess(res, result);
  } catch (err: any) {
    if (err.message === "Invalid credentials") {
      sendError(res, err.message, HTTP_STATUS.UNAUTHORIZED);
      return;
    }
    next(err);
  }
};

export const saveProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.upsertProfile(req.userId!, req.body);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getProfile(req.userId!);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};
