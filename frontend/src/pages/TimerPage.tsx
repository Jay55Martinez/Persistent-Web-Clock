// src/pages/TimerPage.tsx
import React from "react";
import Navbar from "../components/Navbar";
import FishTank from "../components/FishTank";
import "./pages.css"; // assuming this contains your styles

const TimerPage = () => {
  return (
    <div>
      <Navbar />

      <main className="container py-4">
        <div className="row justify-content-end align-items-center">
          {/* Coin Counter (Left) */}
          <section className="row col-auto me-3">
            <label htmlFor="coin-counter" className="col fw-bold">
              Coins:
            </label>
            <div id="coin-counter" className="col fs-3">
              00
            </div>
          </section>

          {/* Store Button (Right but closer) */}
          <section className="col-auto text-start">
            <button type="button" id="store-button" className="btn btn-primary">
              Store
            </button>
          </section>
        </div>

        {/* Timer Controls */}
        <section className="mb-4 text-center">
          <div className="mb-2">
            <select
              id="timer-selection"
              name="subject"
              className="form-select w-auto d-inline-block"
            >
              <option value="subject1">Subject 1</option>
              <option value="subject2">Subject 2</option>
            </select>
          </div>

          <div id="timer" className="display-5 my-3" aria-live="polite">
            00:00
          </div>

          <div className="btn-group" role="group">
            <button type="button" id="start-button" className="btn btn-success">
              Start
            </button>
            <button type="button" id="pause-button" className="btn btn-warning">
              Pause
            </button>
            <button type="button" id="reset-button" className="btn btn-danger">
              Reset
            </button>
          </div>
        </section>

        {/* FishTank Component */}
        <section className="text-center">
          <FishTank />
        </section>
      </main>
    </div>
  );
};

export default TimerPage;
