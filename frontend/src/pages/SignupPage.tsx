import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import useAuthRedirect from "../hooks/useAuthRedirect";
// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useAuthRedirect();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordValidations({
      length: password.length >= 12,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^a-zA-Z0-9]/.test(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for valid email format
    function isValidEmail(email: string) {
      email = email.trim();

      const regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

      // Basic syntax check
      if (!regex.test(email)) return false;

      // Additional check: Domain must not start or end with a dash
      const domain = email.split("@")[1];
      if (!domain || domain.startsWith("-") || domain.endsWith("-"))
        return false;

      // Ensure there are no double dots ".."
      if (email.includes("..")) return false;

      return true;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await signupUser(normalizedEmail, password);
      // No need to store token in localStorage anymore - using cookies
      login(data.user); // Pass user data to login function
      setSuccess(true);
      navigate("/timer");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Email is already registered.");
      } else {
        setError("Signup failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="background"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <div id="card-container" className="card p-5 shadow">
        <div id="text-align" className="text-center">
          <form onSubmit={handleSubmit}>
            <h1 className="text-shadow">Tank Timer</h1>
            <h4 className="text-shadow">Sign up for Tank Timer</h4>
            <input
              id="information-input-email"
              className="input-group mb-2 head-padding form-control shadow"
              type="email"
              placeholder="Email address*"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <div style={{ position: "relative" }}>
              <input
                id="information-input-password"
                className="input-group mb-2 form-control shadow"
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                value={password}
                required
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <br />
            {/* Password requirments */}
            {password != "" && (
              <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                <p
                  style={{
                    color: passwordValidations.length ? "green" : "red",
                  }}
                >
                  At least 12 characters
                </p>
                <p
                  style={{ color: passwordValidations.upper ? "green" : "red" }}
                >
                  At least 1 uppercase letter
                </p>
                <p
                  style={{ color: passwordValidations.lower ? "green" : "red" }}
                >
                  At least 1 lowercase letter
                </p>
                <p
                  style={{
                    color: passwordValidations.number ? "green" : "red",
                  }}
                >
                  At least 1 number
                </p>
                <p
                  style={{
                    color: passwordValidations.special ? "green" : "red",
                  }}
                >
                  At least 1 special character
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="pill-button text-nowrap"> 
              Create Account
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && (
              <p style={{ color: "green" }}>Account created! Redirecting...</p>
            )}
            {loading && <p>Creating your account...</p>}

            <p className="head-padding">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
