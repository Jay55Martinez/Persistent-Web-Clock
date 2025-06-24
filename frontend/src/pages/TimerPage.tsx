// src/pages/TimerPage.tsx
import React from "react";
import Navbar from "../components/Navbar";
import FishTank from "../components/FishTank"

const TimerPage = () => {
  return (
    <div>
      <Navbar />
      <h1>Timer Page</h1>
      <select id="timer" name="subject">
        <option value="subject1">subject1</option>
        <option value="subject2">subject2</option>
      </select>
      <div id="timer">00:00</div>
      <button>Start</button>
      <button>Pause</button>
      <button>Reset</button>
      <FishTank />
    </div>
  );
};

export default TimerPage;
