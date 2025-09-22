import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { useDispatch } from "react-redux";
import { requestPasswordReset, verifyResetCode } from "../api/auth";
import { login, resetPassword } from "../state/user/userSlice";
import { checkIfValidPassword } from "../utils/signup.util";
import type { AppDispatch } from "../state/store";
import ParticlesBackground from "../components/ParticlesBackground";
// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Style
import "./pages.css";

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
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPasswordResetBottom, setShowPasswordResetBottom] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [pageState, setPageState] = useState<
    (typeof PageState)[keyof typeof PageState]
  >(PageState.Login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const resultAction = await dispatch(
      login({ email: normalizedEmail, password, rememberMe })
    );
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
      if (verificationCode && verificationCode.length === 6) {
        const response = await verifyResetCode(
          normalizedEmail,
          Number(verificationCode)
        );
        if (response.status >= 200 && response.status < 300) {
          alert("Verification code is valid!");
          setPageState(PageState.ResetPassword);
        } else {
          alert("Invalid verification code. Please try again.");
        }
      } else {
        alert("Please enter the 6-digit verification code.");
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
      const resultAction = await dispatch(
        resetPassword({
          email: normalizedEmail,
          code: Number(verificationCode),
          password: newPassword,
          rememberMe,
        })
      );
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

  // Reusable password toggle button component
  const PasswordToggle = ({
    show,
    setShow,
  }: {
    show: boolean;
    setShow: (v: boolean) => void;
  }) => (
    <button
      type="button"
      onMouseDown={() => setShow(true)}
      onMouseUp={() => setShow(false)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: "absolute",
        right: "0rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
        <FaEyeSlash style={{ color: "black" }} />
      ) : (
        <FaEye style={{ color: "black" }} />
      )}
    </button>
  );

  return (
    <div
      id="background"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <div className="background-root">
        <ParticlesBackground
          particleCount={70}
          lineDistance={110}
          opacity={0.6}
        />
      </div>
      <div
        id="card-container"
        className="card p-5 shadow"
        style={{ position: "relative" }}
      >
        {pageState === PageState.ForgotPasswordEmail && (
          <button
            id="back-button"
            type="button"
            onClick={() => setPageState(PageState.Login)}
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              padding: "10px",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              zIndex: 50,
              color: "var(--color-primary)",
              borderRadius: "6px",
              transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(-5px)";
              e.currentTarget.style.color = "var(--color-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            aria-label="Go back"
          >
            &#8592;
          </button>
        )}
        <div id="text-align" className="text-center">
          {pageState === PageState.Login && (
            <form onSubmit={handleSubmit}>
              <h1>tankTimer</h1>
              <h4>Log in to tankTimer</h4>
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
              <div
                id="password-input-container"
                style={{ position: "relative" }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    id="information-input-password"
                    className="input-group mb-2 form-control"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password*"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordToggle
                    show={showPassword}
                    setShow={setShowPassword}
                  />
                </div>
                <div
                  className="d-flex justify-content-between align-items-center "
                  style={{ width: "100%" }}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    style={{
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                    }}
                    onClick={() => setPageState(PageState.ForgotPasswordEmail)}
                  >
                    Forgot Password?
                  </button>
                  <div style={{ display: "flex", alignItems: "center" }}>
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
                <button
                  type="submit"
                  className="pill-button head-padding"
                  style={{ width: "100%" }}
                >
                  Login
                </button>
                <p>
                  Don't have an account? <a href="/signup">Sign up</a>
                </p>
              </div>
            </form>
          )}
          {pageState === PageState.ForgotPasswordEmail && (
            <form onSubmit={handlePasswordResetRequest}>
              <h1>Reset Password</h1>
              <h4>Enter your email to reset your password</h4>
              <input
                id="information-input-email"
                className="input-group mb-2 head-padding form-control"
                type="email"
                placeholder="Email address*"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="pill-button head-padding"
                style={{ width: "100%" }}
              >
                Send Reset Link
              </button>
            </form>
          )}
          {pageState === PageState.ForgotPasswordCode && (
            <form onSubmit={checkVerificationCode}>
              <h1>Reset Password</h1>
              <h4>Enter the code you received</h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  margin: "0.5rem 0",
                }}
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <input
                    key={idx}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="text-center form-control head-padding"
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      fontSize: "1.25rem",
                    }}
                    value={verificationCode[idx] ?? ""}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text") || "";
                      const digits = pasted.replace(/\D/g, "").slice(0, 6);
                      if (!digits) return;
                      const filled = Array.from({ length: 6 }).map(
                        (_, i) => digits[i] ?? ""
                      );
                      setVerificationCode(filled.join(""));
                      // focus the next input after pasted digits (or last)
                      const inputs = (
                        e.currentTarget.parentElement as HTMLElement
                      ).querySelectorAll("input");
                      const focusIdx = Math.min(digits.length, 5);
                      if (inputs[focusIdx])
                        (inputs[focusIdx] as HTMLInputElement).focus();
                    }}
                    onChange={(e) => {
                      const ch = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(-1);
                      const newCode = verificationCode.split("");
                      newCode[idx] = ch;
                      const joined = newCode.join("").slice(0, 6);
                      setVerificationCode(joined);
                      // move focus to next input if available
                      const inputs = (
                        e.currentTarget.parentElement as HTMLElement
                      ).querySelectorAll("input");
                      if (ch && inputs[idx + 1]) {
                        (inputs[idx + 1] as HTMLInputElement).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newCode = verificationCode.split("");
                        newCode[idx] = "";
                        setVerificationCode(newCode.join(""));
                        const inputs = (
                          e.currentTarget.parentElement as HTMLElement
                        ).querySelectorAll("input");
                        if (inputs[idx - 1]) {
                          (inputs[idx - 1] as HTMLInputElement).focus();
                        }
                      }
                    }}
                  />
                ))}
              </div>
              <div
                id="button-group"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
                className="head-padding"
              >
                <button type="submit" className="pill-button" style={{ width: "50%" }}>
                  Verify Code
                </button>
                <button
                  type="button"
                  className="pill-button"
                  style={{ width: "50%" }}
                  onClick={handlePasswordResetRequest}
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}
          {pageState === PageState.ResetPassword && (
            <form onSubmit={handleResetPassword}>
              <h1>Reset Password</h1>
              <h4>Enter your new password</h4>
              <div style={{ position: "relative" }}>
                <input
                  id="information-input-new-password"
                  className="input-group mb-2 head-padding form-control"
                  type={showPasswordResetTop ? "text" : "password"}
                  placeholder="New Password*"
                  value={newPassword}
                  required
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordToggle
                  show={showPasswordResetTop}
                  setShow={setShowPasswordResetTop}
                />
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="information-input-confirm-password"
                  className="input-group mb-2 head-padding form-control"
                  type={showPasswordResetBottom ? "text" : "password"}
                  placeholder="Confirm New Password*"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <PasswordToggle
                  show={showPasswordResetBottom}
                  setShow={setShowPasswordResetBottom}
                />
              </div>
              {/* Password requirement feedback rendered in styled box */}
              <div className="password-requirements text-center">
                <h5>Password requirements</h5>
                <div className={`requirement ${checkIfValidPassword(newPassword) ? 'met' : 'unmet'}`}>
                  At least 12 characters
                </div>
                <div className={`requirement ${/[A-Z]/.test(newPassword) ? 'met' : 'unmet'}`}>
                  At least 1 uppercase letter
                </div>
                <div className={`requirement ${/[a-z]/.test(newPassword) ? 'met' : 'unmet'}`}>
                  At least 1 lowercase letter
                </div>
                <div className={`requirement ${/[0-9]/.test(newPassword) ? 'met' : 'unmet'}`}>
                  At least 1 number
                </div>
                <div className={`requirement ${/[^a-zA-Z0-9]/.test(newPassword) ? 'met' : 'unmet'}`}>
                  At least 1 special character
                </div>
                <div className={`requirement ${newPassword === confirmPassword && newPassword !== '' ? 'met' : 'unmet'}`}>
                  Passwords match
                </div>
              </div>
              <button
                type="submit"
                className="pill-button"
                style={{ width: "100%" }}
                disabled={
                  !checkIfValidPassword(newPassword) ||
                  newPassword !== confirmPassword
                }
              >
                Reset Password
              </button>
              {formError && <p style={{ color: "red" }}>{formError}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
