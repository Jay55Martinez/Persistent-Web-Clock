import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkIfValidPassword, isValidEmail } from "../utils/signup.util";
import { useDispatch } from "react-redux";
import { signup, verify, resendVerification } from "../state/user/userSlice";
import type { AppDispatch } from "../state/store";
// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ParticlesBackground from "../components/ParticlesBackground";

const SignupPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Always remember user on signup
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [verifyAccount, setVerifyAccount] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  const handleResendVerification = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    try {
      setError(""); // Clear any existing errors
      setResendSuccess(false); // Clear any existing success message
      setResendLoading(true);
      const result = await dispatch(resendVerification(email));
      if (result.meta.requestStatus === 'fulfilled') {
        setError(""); // Clear errors on success
        setResendSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError("Failed to resend verification code. Please try again.");
      }
    } catch (err) {
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verifyAccount) {
      // Handle verification code submission
      if (!verificationCode.trim()) {
        setError("Please enter the verification code.");
        return;
      }
      // TODO: Add verification logic here
      const result = await dispatch(verify({ email, code: verificationCode, rememberMe }));
      if (result.meta.requestStatus === 'fulfilled') {
        navigate("/timer");
      }
      else {
        setError("Incorrect Code Please try again");
      }
    } else {
      // Handle signup submission
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const result = await dispatch(signup({ email: normalizedEmail, password }));
        
        // Only switch to verify mode if signup was successful
        if (result.meta.requestStatus === 'fulfilled') {
          setVerifyAccount(true);
          setEmail(normalizedEmail);
          setError("");
        } else {
          setError("Signup failed. Please try again.");
        }
      } catch (err: any) {
        if (err.response?.status === 409) {
          setError("Email is already registered.");
        } else {
          setError("Signup failed. Try again.");
        }
      }
    }
  };

  return (
    <div
      id="background"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <div className="background-root">
        <ParticlesBackground particleCount={70} lineDistance={110} opacity={0.6} />
      </div>
      <div id="card-container" className="card p-5 shadow">
        <div id="text-align" className="text-center">
          <form onSubmit={handleSubmit}>
            <h1>Tank Timer</h1>
            <h4>
              {verifyAccount
                ? "Enter verification code"
                : "Sign up for Tank Timer"}
            </h4>
            {!verifyAccount ? (
              <>
                <input
                  id="information-input-email"
                  className="input-group mb-2 head-padding form-control"
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
                    className="input-group mb-2 form-control"
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
                    {showPassword ? <FaEyeSlash style={{ color: 'black' }} /> : <FaEye style={{ color: 'black' }} />}
                  </button>
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} style={{ marginTop: '10px' }}/> Remember Me
                </div>
                <br />
              </>
            ) : (
              <>
                <input
                  id="information-input-code"
                  className="input-group mb-2 head-padding form-control shadow"
                  type="number"
                  placeholder="Enter verification code*"
                  value={verificationCode}
                  required
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <br />
              </>
            )}
            {/* Password requirements - only show during signup */}
            {!verifyAccount && password !== "" && (
              <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                <p
                  style={{
                    color: passwordValidations.length ? "green" : "red",
                  }}
                >
                  At least 12 characters
                </p>
                <p
                  style={{
                    color: passwordValidations.upper ? "green" : "red",
                  }}
                >
                  At least 1 uppercase letter
                </p>
                <p
                  style={{
                    color: passwordValidations.lower ? "green" : "red",
                  }}
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
            <>
            <button
              type="submit"
              disabled={
                verifyAccount
                  ? !verificationCode.trim()
                  : !checkIfValidPassword(password)
              }
              className="pill-button text-nowrap"
            >
              {verifyAccount ? "Verify Code" : "Create Account"}
            </button>
            {verifyAccount && (
              <button 
                type="button" 
                className="pill-button text-nowrap" 
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{ marginLeft: '10px' }}
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            )}
            </>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {resendSuccess && (
              <p style={{ color: "green" }}>Verification code resent successfully!</p>
            )}

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
