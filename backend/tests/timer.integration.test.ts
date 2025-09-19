// Integration test for the timer functionality
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import Timer from "../src/models/timer.model";

describe("Timer Integration Tests", () => {
  it("creates a new timer on POST /api/timer/start", async () => {
    // Create a valid JWT token for testing
    const mockUserId = "64abc1234567890abcdef123";
    // Use 'userId' to match what the auth controller creates
    const token = jwt.sign(
      { userId: mockUserId },
      process.env.JWT_ACCESS_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    const res = await request(app)
      .post("/api/timer/start")
      .set("Authorization", `Bearer ${token}`)
      .send({ isRunning: false });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(mockUserId);

    const timer = await Timer.findOne({ userId: mockUserId });
    expect(timer).not.toBeNull();
    expect(timer?.isRunning).toBe(true);
  });
});

describe("Timer Pause Tests", () => {
  it("pauses an existing timer on POST /api/timer/pause", async () => {
    // Create a valid JWT token for testing
    const mockUserId = "64abc1234567890abcdef123";
    const token = jwt.sign(
      { userId: mockUserId },
      process.env.JWT_ACCESS_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    await request(app)
      .post("/api/timer/start")
      .set("Authorization", `Bearer ${token}`)
      .send({ isRunning: false });

    // wait one second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const res = await request(app)
      .post("/api/timer/pause")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(mockUserId);

    const timer = await Timer.findOne({ userId: mockUserId });

    expect(timer).not.toBeNull();
    expect(timer?.isRunning).toBe(false);
    expect(timer?.totalElapsed).toBeGreaterThan(0);
  });
});

// Test the resetTimer function
describe("Timer Reset Tests", () => {
  it("resets an existing timer on POST /api/timer/reset", async () => {
    // Create a valid JWT token for testing
    const mockUserId = "64abc1234567890abcdef123";
    const token = jwt.sign(
      { userId: mockUserId },
      process.env.JWT_ACCESS_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    // First, start the timer
    const res1 = await request(app)
      .post("/api/timer/start")
      .set("Authorization", `Bearer ${token}`)
      .send( { isRunning: false } );

    expect(res1.status).toBe(200);

    // Wait for a second to ensure the timer has started
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: once the get status function is test we should check that time has elapsed

    // Now rest the timer
    const res = await request(app)
      .post("/api/timer/reset")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.totalElapsed).toBe(0);
    expect(res.body.isRunning).toBe(false);
  });
});

//Get the status of the timer
describe("Timer Status Tests", () => {
  it("should return the status of the timer", async () => {
    // Create a valid JWT token for testing
    const mockUserId = "64abc1234567890abcdef123";
    const token = jwt.sign(
      { userId: mockUserId },
      process.env.JWT_ACCESS_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    // Start the timer
    await request(app)
      .post("/api/timer/start")
      .set("Authorization", `Bearer ${token}`)
      .send( { isUint8Array: true});

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the status of the timer
    const res = await request(app)
      .get("/api/timer/status")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.isRunning).toBe(true);
    expect(res.body.totalElapsed).toBeGreaterThanOrEqual(1); // Should have accumulated time
  });

  it("should return the status of the timer when paused", async () => {
    // Create a valid JWT token for testing
    const mockUserId = "64abc1234567890abcdef123";
    const token = jwt.sign(
      { userId: mockUserId },
      process.env.JWT_ACCESS_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    await request(app)
      .post("/api/timer/reset")
      .set("Authorization", `Bearer ${token}`)
      .send();

    await request(app)
      .post("/api/timer/start")
      .set("Authorization", `Bearer ${token}`)
      .send( { isRunning: false });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Pause the timer
    await request(app)
      .post("/api/timer/pause")
      .set("Authorization", `Bearer ${token}`)
      .send();

    // Get the status of the timer
    const res = await request(app)
      .get("/api/timer/status")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.isRunning).toBe(false);
    expect(res.body.totalElapsed).toBeGreaterThanOrEqual(1);
  });
});

  describe("Timer Reset Tests", () => {
    it("should reset the timer and return status", async () => {
      // Create a valid JWT token for testing
      const mockUserId = "64abc1234567890abcdef123";
      const token = jwt.sign(
      { userId: mockUserId },
      process.env.JWT_ACCESS_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    const res = await request(app)
      .post("/api/timer/reset")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.totalElapsed).toBe(0);
    expect(res.body.isRunning).toBe(false);
  });
});