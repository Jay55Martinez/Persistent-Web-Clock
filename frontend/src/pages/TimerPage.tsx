// src/pages/TimerPage.tsx
import React from "react";
import Navbar from "../components/Navbar";
import FishTank from "../components/FishTank";
import {
  startTimer,
  pauseTimer,
  resetTimer,
  getTimerStatus,
} from "../api/timer";
import "./pages.css";

const TimerPage = () => {
  const [timer, setTimer] = React.useState(0); // in seconds
  const [isRunning, setIsRunning] = React.useState(false);

  // Poll every second to update UI
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setTimer((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getTimerStatus();
        if (data.isRunning && data.startTime) {
          setTimer(data.totalElapsed);
          setIsRunning(true);
        } else {
          setTimer(data.totalElapsed || 0);
          setIsRunning(false);
        }
      } catch (err) {
        console.error("Error fetching timer status", err);
      }
    };

    fetchStatus();
  }, []);

  const handleStart = async () => {
    try {
      const data = await startTimer(isRunning);
      setIsRunning(true);
    } catch (err) {
      console.error("Failed to start timer", err);
    }
  };

  const handlePause = async () => {
    try {
      const data = await pauseTimer();
      setIsRunning(false);
      setTimer(data.totalElapsed); // updated value
    } catch (err) {
      console.error("Failed to pause timer", err);
    }
  };

  const handleReset = async () => {
    try {
      const data = await resetTimer();
      setIsRunning(false);
      setTimer(0);
    } catch (err) {
      console.error("Failed to reset timer", err);
    }
  };

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <Navbar />

      <main className="container py-4">
        <div className="row justify-content-end align-items-center">
          {/* Coin Counter (Left) */}
          {/* <section className="row col-auto me-3">
            <label htmlFor="coin-counter" className="col fw-bold">
              Coins:
            </label>
            <div id="coin-counter" className="col fs-3">
              00
            </div>
          </section> */}

          {/* Store Button (Right but closer) */}
          {/* <section className="col-auto text-start">
            <button type="button" id="store-button" className="btn btn-primary">
              Store
            </button>
          </section> */}
        </div>

        {/* Timer Controls */}
        <section className="mb-4 text-center">
          {/* <div className="mb-2">
            <select
              id="timer-selection"
              name="subject"
              className="form-select w-auto d-inline-block"
            >
              <option value="subject1">Subject 1</option>
              <option value="subject2">Subject 2</option>
            </select>
          </div> */}

          <div id="timer" className="display-5 my-3" aria-live="polite">
            {formatTime(timer)}
          </div>

          <div className="btn-group" role="group">
            <button type="button" id="start-button" className="btn btn-success" onClick={handleStart}>
              Start
            </button>
            <button type="button" id="pause-button" className="btn btn-warning" onClick={handlePause}>
              Pause
            </button>
            <button type="button" id="reset-button" className="btn btn-danger" onClick={handleReset}>
              Reset
            </button>
          </div>
        </section>

        {/* FishTank Component */}
        {/* <section className="text-center">
          <FishTank />
        </section> */}
      </main>
    </div>
  );
};

export default TimerPage;
