// Testing file for Timer model
import {
  startTimer,
  pauseTimer,
  resetTimer,
  getTimerStatus,
} from "../src/controllers/timer.controller";
import Timer from "../src/models/timer.model";
import { Request, Response } from "express";

jest.mock("../src/models/timer.model");

// Test the startTimer function
describe("startTimer", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json = jest.fn();
  let status = jest.fn().mockReturnThis();

  beforeEach(() => {
    req = {
      user: { id: "user123" },
    };
    res = {
      json,
      status,
    };
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    req.user = undefined;
    await startTimer(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should create or update a timer", async () => {
    const mockTimer = {
      userId: "user123",
      isRunning: true,
      startTime: new Date(),
    };
    (Timer.findOneAndUpdate as jest.Mock).mockResolvedValue(mockTimer);

    await startTimer(req as Request, res as Response);

    expect(Timer.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user123" },
      expect.objectContaining({ isRunning: true }),
      { upsert: true, new: true }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockTimer);
  });

  it("should handle db errors and return 500", async () => {
    (Timer.findOneAndUpdate as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );
    await startTimer(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Failed to start timer" });
  });
});

// Test the pauseTimer function
describe("pauseTimer", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json = jest.fn();
  let status = jest.fn().mockReturnThis();

  beforeEach(() => {
    req = {
      user: { id: "user123" },
    };
    res = {
      json,
      status,
    };
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    req.user = undefined;
    await pauseTimer(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
  it("should return 400 if timer is not running", async () => {
    const mockTimer = {
      userId: "user123",
      isRunning: false,
      startTime: null,
      totalElapsed: 0,
    };

    // Hey, when Timer.findOne(...) gets called inside the controller,
    // don’t actually go to the database. Instead, pretend it ran and
    // just give me this mockTimer object back
    (Timer.findOne as jest.Mock).mockResolvedValue(mockTimer);

    await pauseTimer(req as Request, res as Response);

    expect(Timer.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Timer is not running" });
  });
  it("should pause a running timer and return the updated timer", async () => {
    // Simulate start time 2 minutes ago
    const start = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

    const mockTimer = {
      userId: "user123",
      isRunning: true,
      startTime: start,
      totalElapsed: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };

    // Mock the timer object that gets returned by findOne
    (Timer.findOne as jest.Mock).mockResolvedValue(mockTimer);

    await pauseTimer(req as Request, res as Response);

    expect(Timer.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockTimer.save).toHaveBeenCalled();

    // Verify that the timer properties were updated correctly
    expect(mockTimer.isRunning).toBe(false);
    expect(mockTimer.startTime).toBe(null);
    expect(mockTimer.totalElapsed).toBeGreaterThan(0); // Should have accumulated time

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockTimer);
  });
});

// Test the resetTimer function
// Start a timer and then reset it
describe("resetTimer", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json = jest.fn();
  let status = jest.fn().mockReturnThis();

  beforeEach(() => {
    req = {
      user: { id: "user123" },
    };
    res = {
      json,
      status,
    };
    jest.clearAllMocks();
  });

  it("should should start a timer and then reset it", async () => {
    const mockTimer = {
      userId: "user123",
      isRunning: true,
      startTime: new Date(),
      totalElapsed: 10,
    };
    (Timer.findOneAndUpdate as jest.Mock).mockResolvedValue(mockTimer);

    await startTimer(req as Request, res as Response);

    expect(Timer.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user123" },
      expect.objectContaining({ isRunning: true }),
      { upsert: true, new: true }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockTimer);

    // Now reset the timer
    const resetMockTimer = {
      userId: "user123",
      isRunning: false,
      startTime: null,
      totalElapsed: 0,
    };
    (Timer.findOneAndUpdate as jest.Mock).mockResolvedValue(resetMockTimer);

    await resetTimer(req as Request, res as Response);

    expect(Timer.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user123" },
      { startTime: null, isRunning: false, totalElapsed: 0 },
      { upsert: true, new: true }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(resetMockTimer);
  });
});

// This is still a work in progress, but we want to test the getTimerStatus function
/*
Does the past test infulence the current test? - need to check with chatgpt

need to test:
- what if I start a timer and the timer is already running?
- what if I pause a timer and the timer is already paused?
- think of other edge cases
*/
// Test the getTimerStatus funtion TEST IS FAILING
describe("getTimerStatus", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
    };
    json = jest.fn();
    status = jest.fn().mockReturnThis();
    res = {
      json,
      status,
    };
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    req.user = undefined;

    await getTimerStatus(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if no timer exists", async () => {
    (Timer.findOne as jest.Mock).mockResolvedValue(null);

    await getTimerStatus(req as Request, res as Response);

    expect(Timer.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: "Timer not found" });
  });

  it("should return the timer if found and not running", async () => {
    const mockTimer = {
      userId: "user123",
      isRunning: false,
      startTime: new Date(),
      totalElapsed: 100,
    };

    (Timer.findOne as jest.Mock).mockResolvedValue(mockTimer);

    await getTimerStatus(req as Request, res as Response);

    expect(Timer.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        isRunning: false,
        totalElapsed: 100,
      })
    );
  });

  it("should return the timer if found and running", async () => {
    const mockTimer = {
      userId: "user123",
      isRunning: true,
      startTime: new Date(),
      totalElapsed: 20,
    };

    (Timer.findOne as jest.Mock).mockResolvedValue(mockTimer);

    await getTimerStatus(req as Request, res as Response);

    expect(Timer.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        isRunning: true,
        totalElapsed: 20,
      })
    );
  });

  it("should handle calculating elapsed time correctly", async () => {
    const mockTimer = {
      userId: "user123",
      isRunning: true,
      startTime: new Date(Date.now() - 5000), // started 5 seconds ago
      totalElapsed: 0,
    };

    (Timer.findOne as jest.Mock).mockResolvedValue(mockTimer);

    await getTimerStatus(req as Request, res as Response);

    expect(Timer.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        isRunning: true,
        totalElapsed: 5,
      })
    );
  });
});
