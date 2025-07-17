import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { connectSocket, disconnectSocket } from "../utils/socket";
// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Style
import "./pages.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useAuthRedirect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await loginUser(normalizedEmail, password);
      // No need to store token in localStorage anymore - using cookies
      login(data.user); // Pass user data to login function
      disconnectSocket();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1000ms
      connectSocket(data.user.id); // Connect the socket
      navigate("/timer");
    } catch (err) {
      alert("Login failed. Check credentials.");
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
