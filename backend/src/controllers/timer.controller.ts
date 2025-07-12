// backend/src/timer.controller.ts
import { Request, Response } from "express";
import Timer from "../models/timer.model";

/**
 * Starts the timer for the authenticated user. If the timer is not running,
 * it sets the start time to the current time and marks the timer as running.
 * If the timer is already running, it returns a 204 status with a message.
 * @param req - The request object containing user information.
 * @param res - The response object to send the status.
 * @returns A JSON response indicating the result of the start operation.
 */
export const startTimer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    if (!req.body.isRunning) {
      const timer = await Timer.findOneAndUpdate(
        { userId },
        { startTime: new Date(), isRunning: true },
        { upsert: true, new: true }
      );

      // Emit socket event to user-specific room
      const io = req.app.get('io');
      io?.to(userId).emit('timer:started', timer);

      return res.status(200).json(timer);
    } else {
      return res.status(204).json({ message: "Timer is already running" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to start timer" });
  }
};

/**
 * Pauses the timer for the authenticated user. Calculates the elapsed time since the timer was started,
 * updates the total elapsed time, and sets the timer to not running. Sets the start time to null.
 * @param req - The request object containing user information.
 * @param res - The response object to send the status.
 * @returns A JSON response indicating the result of the pause operation.
 */
export const pauseTimer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    const timer = await Timer.findOne({ userId });
    if (!timer || !timer.isRunning || !timer.startTime) {
      return res.status(400).json({ error: "Timer is not running" });
    }

    const now = new Date();
    const elapsed = Math.floor(
      (now.getTime() - timer.startTime.getTime()) / 1000
    );
    timer.totalElapsed += elapsed;
    timer.isRunning = false;
    timer.startTime = null;
    await timer.save();

    // Emit socket event to user-specific room
    const io = req.app.get('io');
    io?.to(userId).emit('timer:paused', timer);

    return res.status(200).json(timer);
  } catch (error) {
    return res.status(500).json({ error: "Failed to pause timer" });
  }
};

/**
 * Resets the timer for the authenticated user.
 * @param req - The request object containing user information.
 * @param res - The response object to send the status.
 * @returns A JSON response indicating the result of the reset operation.
 */
export const resetTimer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    const timer = await Timer.findOneAndUpdate(
      { userId },
      { startTime: null, isRunning: false, totalElapsed: 0 },
      { new: true, upsert: true }
    );

    // Emit socket event to user-specific room
    const io = req.app.get('io');
    io?.to(userId).emit('timer:reset', timer);

    return res.status(200).json(timer);
  } catch (error) {
    return res.status(500).json({ error: "Failed to reset timer" });
  }
};

/**
 * Get the current status of the timer for the authenticated user. Updates the total elapsed 
 * time based on whether the timer is running or not. If the timer is running, it calculates
 * the elapsed time since the last start time and sets the start time to the current time.
 * @param req - The request object containing user information.
 * @param res - The response object to send the status.
 * @returns A JSON response with the timer status or an error message.
 */
export const getTimerStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    const timer = await Timer.findOne({ userId });
    if (!timer) {
      return res.status(404).json({ error: "Timer not found" });
    }

    let totalTime = timer.totalElapsed;
    const now = new Date(Date.now());
    // Make sure the timer is running and the timer has a start time
    if (timer.isRunning && timer.startTime) {
      // Add the time from the start
      totalTime += Math.floor(
        (now.getTime() - timer.startTime.getTime()) / 1000
      );
    }

    return res
      .status(200)
      .json({
        totalElapsed: totalTime,
        isRunning: timer.isRunning,
        startTime: timer.isRunning ? now : timer.startTime,
      });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve timer status" });
  }
};
