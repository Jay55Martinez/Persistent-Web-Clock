import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { checkIfValidPassword, isValidEmail } from "../utils/signup.util";
import { useDispatch } from "react-redux";
import { signup, verify, resendVerification } from "../state/user/userSlice";
import type { AppDispatch } from "../state/store";
import OAuthLogin from "../components/OAuthGoogle";
// Icons
import PasswordToggle from "../components/PasswordToggle";
import VerificationCodeInput from "../components/VerificationCodeInput";
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
  length: value.length >= 12,
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
            {verifyAccount ? (
              <>
                <h1>Verify Account</h1>
                <h4>Enter the code you received</h4>
              </>
            ) : (
              <>
                <h1>Tank Timer</h1>
                <h4>Sign up for Tank Timer</h4>
              </>
            )}
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
                <div>
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
                  <PasswordToggle show={showPassword} setShow={setShowPassword} />
                </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <label
                      style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      }}
                    >
                      <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      style={{ marginRight: "5px" }}
                      />
                      Remember Me
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <VerificationCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  length={6}
                />
                <br />
              </>
            )}
            {/* Password requirements - styled like LoginPage using theme.css */}
            {!verifyAccount && password !== "" && (
              <div className="password-requirements">
                <h5>Password requirements</h5>
                <div className={`requirement ${passwordValidations.length ? 'met' : 'unmet'}`}>
                  At least 12 characters
                </div>
                <div className={`requirement ${passwordValidations.upper ? 'met' : 'unmet'}`}>
                  At least 1 uppercase letter
                </div>
                <div className={`requirement ${passwordValidations.lower ? 'met' : 'unmet'}`}>
                  At least 1 lowercase letter
                </div>
                <div className={`requirement ${passwordValidations.number ? 'met' : 'unmet'}`}>
                  At least 1 number
                </div>
                <div className={`requirement ${passwordValidations.special ? 'met' : 'unmet'}`}>
                  At least 1 special character
                </div>
              </div>
            )}
            <>
              {verifyAccount ? (
                <div
                  id="button-group"
                  style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}
                >
                  <button
                    type="submit"
                    disabled={!verificationCode.trim()}
                    className="pill-button"
                    style={{ width: "50%" }}
                  >
                    Verify Code
                  </button>
                  <button
                    type="button"
                    className="pill-button"
                    style={{ width: "50%" }}
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    disabled={!checkIfValidPassword(password)}
                    className="pill-button text-nowrap head-padding"
                  style={{ width: "100%" }}
                >
                  Create Account
                </button>
                <OAuthLogin />
                </div>
              )}
            </>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {resendSuccess && (
              <p style={{ color: "green" }}>Verification code resent successfully!</p>
            )}
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
