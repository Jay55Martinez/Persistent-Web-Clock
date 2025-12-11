import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { useDispatch } from "react-redux";
import { requestPasswordReset, verifyResetCode } from "../api/auth";
import { login, resetPassword } from "../state/user/userSlice";
import { checkIfValidPassword } from "../utils/signup.util";
import type { AppDispatch } from "../state/store";
import ParticlesBackground from "../components/ParticlesBackground";
import PasswordToggle from "../components/PasswordToggle";
import VerificationCodeInput from "../components/VerificationCodeInput";
import OAuthLogin from "../components/OAuthGoogle";
// Icons
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
  const [codeShake, setCodeShake] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [pwShake, setPwShake] = useState(false);
  const [newPwShake, setNewPwShake] = useState(false);
  const [confirmPwShake, setConfirmPwShake] = useState(false);
  const [emailShake, setEmailShake] = useState(false);
  const [pageState, setPageState] = useState<
    (typeof PageState)[keyof typeof PageState]
  >(PageState.Login);
  const navigate = useNavigate();

  const triggerShake = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    // custom email validation to avoid native popup
    const emailValid = normalizedEmail.includes("@");
    if (!emailValid) {
      // keep highlighted until next submit attempt
      setEmailShake(true);
      return;
    } else if (emailShake) {
      // clear highlight only on submit when email becomes valid
      setEmailShake(false);
    }
    const resultAction = await dispatch(
      login({ email: normalizedEmail, password, rememberMe })
    );
    if (login.fulfilled.match(resultAction)) {
      const user = resultAction.payload as { email?: string | null };
      disconnectSocket();
      connectSocket(user?.email ?? null);
      navigate("/timer");
    } else {
      // Trigger shake animation on password input
      triggerShake(setPwShake);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    // validate email before calling API
    const emailValid = normalizedEmail.includes("@");
    if (!emailValid) {
      // keep highlighted until next submit attempt
      setEmailShake(true);
      return;
    } else if (emailShake) {
      // clear highlight only on submit when email becomes valid
      setEmailShake(false);
    }
    try {
      const response = await requestPasswordReset(normalizedEmail);
      if (response.status >= 200 && response.status < 300) {
        // alert("Reset link sent! Please check your email.");
        setPageState(PageState.ForgotPasswordCode);
      } else {
        // Trigger shake on email input
        triggerShake(setEmailShake);
      }
    } catch (err) {
      triggerShake(setEmailShake);
    }
  };

  const checkVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (verificationCode && verificationCode.length === 6) {
        if (codeShake) setCodeShake(false); // clear previous shake on valid attempt
        const response = await verifyResetCode(
          normalizedEmail,
          Number(verificationCode)
        );
        if (response.status >= 200 && response.status < 300) {
          setPageState(PageState.ResetPassword);
        } else {
          setCodeShake(true);
        }
      } else {
        setCodeShake(true);
      }
    } catch (err) {
      setCodeShake(true);
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
  setNewPwShake(true);
      return;
    }
    // Validate match
    if (newPassword !== confirmPassword) {
  setFormError("Passwords do not match.");
  setConfirmPwShake(true);
      return;
    }

    try {
  if (newPwShake) setNewPwShake(false);
  if (confirmPwShake) setConfirmPwShake(false);
      const resultAction = await dispatch(
        resetPassword({
          email: normalizedEmail,
          code: Number(verificationCode),
          password: newPassword,
          rememberMe,
        })
      );
      if (resetPassword.fulfilled.match(resultAction)) {
        const user = resultAction.payload as { email?: string | null };
        disconnectSocket();
        connectSocket(user?.email ?? null);
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
            <form noValidate onSubmit={handleSubmit}>
              <h1>tankTimer</h1>
                <h4>Log in to tankTimer</h4>
                <div style={{ position: 'relative' }}>
                {emailShake && (
                  <div 
                  style={{
                  position: 'absolute',
                  left: '0',
                  top: '100%',
                  color: 'red',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem'
                  }}
                  >
                  *Please enter a valid email address.
                  </div>
                )}
                <input
                  id="information-input-email"
                  className={`input-group mb-2 head-padding form-control ${emailShake ? 'shake' : ''}`}
                  type="email"
                  placeholder="Email address*"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={emailShake || undefined}
                />
                </div>
                <br />
              <div
                id="password-input-container"
                style={{ position: "relative" }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    id="information-input-password"
                    className={`input-group mb-2 form-control ${pwShake ? 'shake' : ''}`}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    className="pill-button head-padding"
                    style={{ width: "100%" }}
                  >
                    Login
                  </button>
                  <OAuthLogin />
                </div>
                <p>
                  Don't have an account? <a href="/signup">Sign up</a>
                </p>
              </div>
            </form>
          )}
          {pageState === PageState.ForgotPasswordEmail && (
            <form noValidate onSubmit={handlePasswordResetRequest}>
              <h1>Reset Password</h1>
              <h4>Enter your email to reset your password</h4>
              <div style={{ position: 'relative' }}>
              {emailShake && (
                  <div 
                  style={{
                  position: 'absolute',
                  left: '0',
                  top: '100%',
                  color: 'red',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem'
                  }}
                  >
                  *Please enter a valid email address.
                  </div>
                )}
              <input
                id="information-input-email"
                className={`input-group mb-2 head-padding form-control ${emailShake ? 'shake' : ''}`}
                type="email"
                placeholder="Email address*"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailShake || undefined}
              />
              </div>
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
              <VerificationCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
                length={6}
                shake={codeShake}
              />
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
                  className={`input-group mb-2 head-padding form-control ${newPwShake ? 'shake' : ''}`}
                  type={showPasswordResetTop ? "text" : "password"}
                  placeholder="New Password*"
                  value={newPassword}
                  required
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-invalid={newPwShake || undefined}
                />
                <PasswordToggle
                  show={showPasswordResetTop}
                  setShow={setShowPasswordResetTop}
                />
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="information-input-confirm-password"
                  className={`input-group mb-2 head-padding form-control ${confirmPwShake ? 'shake' : ''}`}
                  type={showPasswordResetBottom ? "text" : "password"}
                  placeholder="Confirm New Password*"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={confirmPwShake || undefined}
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
