// backend/src/timer.controller.ts
import { Request, Response } from "express";
import Timer from "../models/timer.model";

export const startTimer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    if (! req.body.isRunning) {
      const timer = await Timer.findOneAndUpdate(
        { userId },
        { startTime: new Date(), isRunning: true },
        { upsert: true, new: true }
      );

      return res.status(200).json(timer);
    }
    else {
      return res.status(204).json({ message: "Timer is already running"});
    }; 
  } catch (error) {
    return res.status(500).json({ error: "Failed to start timer" });
  }
};

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

    return res.status(200).json(timer);
  } catch (error) {
    return res.status(500).json({ error: "Failed to pause timer" });
  }
};

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
    return res.status(200).json(timer);
  } catch (error) {
    return res.status(500).json({ error: "Failed to reset timer" });
  }
};

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

    // Make sure the timer is running and the timer has a start time
    if (timer.isRunning && timer.startTime) {
      const now = new Date(Date.now());
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
        startTime: timer.startTime,
      });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve timer status" });
  }
};
