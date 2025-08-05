import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../state/user/userSlice";
import type { AppDispatch, RootState } from "../state/store";
// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Style
import "./pages.css";

const LoginPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useAuthRedirect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    // No need to store token in localStorage anymore - using cookies
    const resultAction = await dispatch(login({ email: normalizedEmail, password }));
    if (login.fulfilled.match(resultAction)) {
      disconnectSocket();
      connectSocket(resultAction.payload.user.id); // Connect the socket
      navigate("/timer");
    }
    else {
      // Want to increament the number of times that you can enter a password before you get locked out
      alert("Invalid Password!")
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
            <button type="submit" className="pill-button">Login</button>
          </form>
          <p className="head-padding">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
