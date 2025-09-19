import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TimerPage from "./pages/TimerPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import type { RootState } from "./state/store";
import { useSelector } from "react-redux";
import { useAuth } from "./context/AuthContext";
import type { JSX } from "react";
import PublicRoute from "./components/PublicRoute";
// Global styles
import './styles/theme.css'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.user);
  // wait
  const { authLoading } = useAuth();
  if (authLoading) {
    return <div>Loading...</div>; // or a spinner
  }
  return user.isLoggedIn ? children : <Navigate to="/" />;
};

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
  <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route
          path="/timer"
          element={
            <ProtectedRoute>
              <TimerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
