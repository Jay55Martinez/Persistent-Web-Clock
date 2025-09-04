import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { useDispatch } from "react-redux";
import { requestPasswordReset, verifyResetCode } from "../api/auth";
import { login, resetPassword } from "../state/user/userSlice";
import { checkIfValidPassword } from "../utils/signup.util";
import type { AppDispatch } from "../state/store";
// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Style
import "./pages.css";

/*
TODO:
- Ensure the new password isn't the same as the old one
- Resend code
*/

const PageState = {
  Login: 0,
  ForgotPasswordEmail: 1,
  ForgotPasswordCode: 2,
  ResetPassword: 3,
} as const;

/*
Responsible for rendering the login page and handling user authentication.
*/
const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordResetTop, setShowPasswordResetTop] = useState(false);
  const [showPasswordResetBottom, setShowPasswordResetBottom] = useState(false);
  const [verificationCode, setVerificationCode] = useState<number | undefined>(undefined);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [pageState, setPageState] = useState<typeof PageState[keyof typeof PageState]>(PageState.Login);
  const navigate = useNavigate();

  useAuthRedirect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const resultAction = await dispatch(login({ email: normalizedEmail, password }));
    if (login.fulfilled.match(resultAction)) {
      disconnectSocket();
      connectSocket(resultAction.payload.user.id);
      navigate("/timer");
    } else {
      alert("Invalid Password!");
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const response = await requestPasswordReset(normalizedEmail);
      if (response.status >= 200 && response.status < 300) {
        alert("Reset link sent! Please check your email.");
        setPageState(PageState.ForgotPasswordCode);
      } else {
        alert("Failed to send reset link. Please try again.");
      }
    } catch (err) {
      alert("Error sending reset link. Please try again.");
    }
  };

  const checkVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (verificationCode) {
        const response = await verifyResetCode(normalizedEmail, verificationCode);
        if (response.status >= 200 && response.status < 300) {
          alert("Verification code is valid!");
          setPageState(PageState.ResetPassword);
        } else {
          alert("Invalid verification code. Please try again.");
        }
      }
    } catch (err) {
      alert("Error verifying code. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setFormError("");
    // Validate code
    if (!verificationCode) {
      setFormError("Verification code missing. Please request a new one.");
      return;
    }
    // Validate password rules
    if (!checkIfValidPassword(newPassword)) {
      setFormError("Password does not meet requirements.");
      return;
    }
    // Validate match
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      const resultAction = await dispatch(resetPassword({ email: normalizedEmail, code: verificationCode, password: newPassword }));
      if (resetPassword.fulfilled.match(resultAction)) {
        disconnectSocket();
        connectSocket(resultAction.payload.user.id);
        navigate("/timer");
      } else {
        setFormError("Failed to reset password. Please try again.");
      }
    } catch (err) {
      setFormError("Error resetting password. Please try again.");
    }
  };

  return (
    <div
      id="background"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <div id="card-container" className="card p-5 shadow" style={{ position: 'relative' }}>
        {pageState === PageState.ForgotPasswordEmail && (
          <button
            type="button"
            onClick={() => setPageState(PageState.Login)}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#333',
              zIndex: 10
            }}
            aria-label="Go back"
          >
            &#8592;
          </button>
        )}
        <div id="text-align" className="text-center">
          {pageState === PageState.Login && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-shadow">Tank Timer</h1>
              <h4 className="text-shadow">Log in to Tank Timer</h4>
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
                  onChange={(e) => setPassword(e.target.value)}
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
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ textDecoration: "underline", background: "none", border: "none" }}
                onClick={() => setPageState(PageState.ForgotPasswordEmail)}
              >
                Forgot Password?
              </button>
              <button type="submit" className="pill-button">Login</button>
              <p className="head-padding">
                Don't have an account? <a href="/signup">Sign up</a>
              </p>
            </form>
          )}
          {pageState === PageState.ForgotPasswordEmail && (
            <form onSubmit={handlePasswordResetRequest}>
              <h1 className="text-shadow">Reset Password</h1>
              <h4 className="text-shadow">Enter your email to reset your password</h4>
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
              <button type="submit" className="pill-button">Send Reset Link</button>
            </form>
          )}
          {pageState === PageState.ForgotPasswordCode && (
            <form onSubmit={checkVerificationCode}>
              <h1 className="text-shadow">Reset Password</h1>
              <h4 className="text-shadow">Enter the code you received</h4>
              <input
                id="information-input-code"
                className="input-group mb-2 head-padding form-control shadow"
                type="text"
                placeholder="Verification Code*"
                value={verificationCode}
                required
                onChange={(e) => setVerificationCode(Number(e.target.value))}
              />
              <br />
              <button type="submit" className="pill-button">Verify Code</button>
            </form>
            )}
          {pageState === PageState.ResetPassword && (
            <form onSubmit={handleResetPassword}>
              <h1 className="text-shadow">Reset Password</h1>
              <h4 className="text-shadow">Enter your new password</h4>
              <div style={{ position: "relative" }}>
              <input
                id="information-input-new-password"
                className="input-group mb-2 head-padding form-control shadow"
                type={showPasswordResetTop ? "text" : "password"}
                placeholder="New Password*"
                value={newPassword}
                required
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                  type="button"
                  onMouseDown={() => setShowPasswordResetTop(true)}
                  onMouseUp={() => setShowPasswordResetTop(false)}
                  onMouseLeave={() => setShowPasswordResetTop(false)}
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
                <div style={{ position: "relative" }}>
              <input
                id="information-input-confirm-password"
                className="input-group mb-2 head-padding form-control shadow"
                type={showPasswordResetBottom ? "text" : "password"}
                placeholder="Confirm New Password*"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                  type="button"
                  onMouseDown={() => setShowPasswordResetBottom(true)}
                  onMouseUp={() => setShowPasswordResetBottom(false)}
                  onMouseLeave={() => setShowPasswordResetBottom(false)}
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
              {/* Password requirement feedback */}
              <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                <p style={{ color: checkIfValidPassword(newPassword) ? "green" : "red" }}>Password meets complexity requirements</p>
                <p style={{ color: newPassword === confirmPassword && newPassword !== "" ? "green" : "red" }}>{newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}</p>
              </div>
              <br />
              <button type="submit" className="pill-button" disabled={!checkIfValidPassword(newPassword) || newPassword !== confirmPassword}>Reset Password</button>
              {formError && <p style={{ color: 'red' }}>{formError}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
