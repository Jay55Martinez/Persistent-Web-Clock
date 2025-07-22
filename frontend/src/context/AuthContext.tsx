// AuthProvider Login and Logout
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  checkAuth } from "../state/user/userSlice";
import type { RootState, AppDispatch } from "../state/store";
import type { ReactNode } from "react";

type User = {
  id: string;
  email: string;
  isVerified: boolean;
};

type AuthContextType = {
  isLoggedIn: boolean;
  authLoading: boolean;
  user: User | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);
  const [authLoading, setAuthLoading] = useState(true);
  const isLoggedIn = userState.isLoggedIn;

  // Map userState to User | null
  const user: User | null = userState && userState.id && userState.email
    ? {
        id: userState.id as string,
        email: userState.email as string,
        isVerified: userState.isVerified,
      }
    : null;

  // Run initial auth-check
  useEffect(() => {
    dispatch(checkAuth()).finally(() => setAuthLoading(false));
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, authLoading, user}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
