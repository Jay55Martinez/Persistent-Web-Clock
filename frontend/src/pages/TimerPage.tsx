import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  startTimer,
  pauseTimer,
  resetTimer,
  getTimerStatus,
} from "../api/timer";
import socket, { connectSocket, disconnectSocket } from "../utils/socket";
import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
// styling
import "./pages.css";
import ParticlesBackground from "../components/ParticlesBackground";

const TimerPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [displayedTime, setDisplayedTime] = useState(0);


  // Poll every second to update UI
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && startTime) {
        const now = Date.now();
        const elapsed = (now - new Date(startTime).getTime()) / 1000;

        setDisplayedTime(totalElapsed + elapsed);
      } else {
        setDisplayedTime(totalElapsed);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning, startTime, totalElapsed]);

  // Fetch initial timer status and handles fetching current time on webpage refresh
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
          const elapsed = (now - new Date(data.startTime).getTime()) / 1000;

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
    console.log("Connecting socket for user:", user.email);
    connectSocket(user.email);
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

    socket.on("timer:status", (data) => {
      setIsRunning(data.isRunning);
      setStartTime(data.startTime ? new Date(data.startTime) : null);
      setTotalElapsed(data.totalElapsed || 0);

      // Set displayedTime immediately to avoid UI jump
      if (data.isRunning && data.startTime) {
        const now = Date.now();
        const elapsed = (now - new Date(data.startTime).getTime()) / 1000
        setDisplayedTime((data.totalElapsed || 0) + elapsed);
      } else {
        setDisplayedTime(data.totalElapsed || 0);
      }
    });

    return () => {
      socket.off("timer:paused");
      socket.off("timer:started");
      socket.off("timer:reset");
      socket.off("timer:status");
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
      }
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
    const totalMilliseconds = Math.floor(seconds * 1000);
    const h = String(Math.floor(totalMilliseconds / 3600000)).padStart(2, "0");
    const m = String(Math.floor((totalMilliseconds % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((totalMilliseconds % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <div className="background-root">
        <ParticlesBackground particleCount={70} lineDistance={110} opacity={0.6} />
      </div>
      <Navbar />
      <main className="container py-4">
        {/* Timer Controls */}
        <section className="mb-4 text-center centered-element">
          <div id="timer" className="display-5 my-3 " aria-live="polite">
            <h1 className="timer-text">{formatTime(displayedTime)}</h1>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button
              type="button"
              id="start-button"
              className="timer-button start"
              onClick={handleStart}
            >
              Start
            </button>
            <button
              type="button"
              id="pause-button"
              className="timer-button pause"
              onClick={handlePause}
            >
              Pause
            </button>
            <button
              type="button"
              id="reset-button"
              className="timer-button reset"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TimerPage;