import type { Request, Response, NextFunction } from "express";
import * as workoutService from "../services/workout.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/http.js";

export const createWorkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workout = await workoutService.createWorkout(req.userId!, req.body);
    sendSuccess(res, workout, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

export const getAllWorkouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workouts = await workoutService.getUserWorkouts(req.userId!);
    sendSuccess(res, workouts);
  } catch (err) {
    next(err);
  }
};

export const getWorkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workout = await workoutService.getWorkoutById(req.userId!, req.params.id as string);
    if (!workout) { res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Workout not found" }); return; }
    sendSuccess(res, workout);
  } catch (err) {
    next(err);
  }
};
