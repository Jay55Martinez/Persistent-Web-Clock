import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import type { RootState } from "../state/store";
import type { JSX } from "react";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.user);
  const { authLoading } = useAuth();

  if (authLoading) return <div>Loading...</div>;

  // If logged in, redirect to timer, otherwise render the public page
  return user.isLoggedIn ? <Navigate to="/timer" /> : children;
};

export default PublicRoute;
