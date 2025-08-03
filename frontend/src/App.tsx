import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TimerPage from "./pages/TimerPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import VerificationPage from "./pages/VerificationPage";
import type { RootState } from "./state/store";
import { useSelector } from "react-redux";
import { useAuth } from "./context/AuthContext";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.user);
  // wait
  const { authLoading } = useAuth();
  if (authLoading) {
    return <div>Loading...</div>; // or a spinner
  }
  return user.isLoggedIn ? children : <Navigate to="/" />;
};

const PendingVerification = ({ children }: { children: JSX.Element }) => {
  console.log(localStorage.getItem("verifyEmail"))
  if (localStorage.getItem("verifyEmail")) {
    return children;
  }
  return <Navigate to="/signup"/>
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/verify" 
          element={
            <PendingVerification>
             <VerificationPage />
            </PendingVerification>
          }
        />
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
