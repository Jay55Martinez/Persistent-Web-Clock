import {useEffect, useState} from "react";
import Navbar from "../components/Navbar";
import {
  startTimer,
  pauseTimer,
  resetTimer,
  getTimerStatus,
} from "../api/timer";
import socket, { connectSocket, disconnectSocket } from "../utils/socket";
// styling 
import "./pages.css";

const TimerPage = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [displayedTime, setDisplayedTime] = useState(0);

  // Poll every second to update UI
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && startTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - new Date(startTime).getTime()) / 1000);
        setDisplayedTime(totalElapsed + elapsed);
      } else {
        setDisplayedTime(totalElapsed);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning, startTime, totalElapsed]);

  // Fetch initial timer status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getTimerStatus();
        setIsRunning(data.isRunning);
        setStartTime(data.startTime ? new Date(data.startTime) : null);
        setTotalElapsed(data.totalElapsed || 0);

        // Set displayedTime immediately to avoid UI jump
        if (data.isRunning && data.startTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - new Date(data.startTime).getTime()) / 1000);
          setDisplayedTime((data.totalElapsed || 0) + elapsed);
        } else {
          setDisplayedTime(data.totalElapsed || 0);
        }
      } catch (err) {
        console.error("Error fetching timer status", err);
      }
    };

    fetchStatus();
  }, []);

  // Connect to socket
  useEffect(() => {
    connectSocket(sessionStorage.getItem('userId') || undefined);
    return () => {
      disconnectSocket();
    };
  }, []);

  // Listen for socket events
  useEffect(() => {
    socket.on("timer:paused", (data) => {
      // console.log("Timer paused", data);
      // update state to reflect pause
      setIsRunning(false);
      setTotalElapsed(data.totalElapsed || 0);
      setStartTime(null); // null since a start time will be recieved on next start
    });

    socket.on("timer:started", (data) => {
      // console.log("Timer started", data);
      // update state to reflect start
      if (data) {
        setIsRunning(true);
        setStartTime(new Date(data.startTime));
        setTotalElapsed(data.totalElapsed || 0);
      }
    });

    socket.on("timer:reset", (data) => {
      // console.log("Timer reset", data);
      // update state to reset timer
      setIsRunning(false);
      setTotalElapsed(0);
      setStartTime(null);
    });

    return () => {
      socket.off("timer:paused");
      socket.off("timer:started");
      socket.off("timer:reset");
    };
  }, []);

  const handleStart = async () => {
    try {
      // If already running, just return
      if (isRunning) {
        return;
      }

      // Send request to start timer if the timer is not running
      const data = await startTimer(isRunning);

      // If the timer was successfully started, update state
      if (data) {
        setIsRunning(true);
        setStartTime(new Date(data.startTime));
        setTotalElapsed(data.totalElapsed || 0);
      };
    } catch (err) {
      console.error("Failed to start timer", err);
    }
  };

  const handlePause = async () => {
    try {
      const data = await pauseTimer();
      setIsRunning(false);
      setTotalElapsed(data.totalElapsed || 0);
      setStartTime(null); // null since a start time will be recieved on next start
    } catch (err) {
      console.error("Failed to pause timer", err);
    }
  };

  const handleReset = async () => {
    try {
      await resetTimer();
      setIsRunning(false);
      setTotalElapsed(0);
      setStartTime(null);
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
            {formatTime(displayedTime)}
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
