import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TimerPage from "./pages/TimerPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./context/AuthContext";
import type { JSX } from "react";


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, authLoading } = useAuth();
  if (authLoading)
    {
      return <div>Loading...</div>;
    }
  return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
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
