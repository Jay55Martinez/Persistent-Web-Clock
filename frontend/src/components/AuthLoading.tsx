import { FaArrowRotateRight } from "react-icons/fa6";
import "./AuthLoading.css";

export const AuthLoading = () => {
  return (
    <div className="auth-loading-container">
      <FaArrowRotateRight className="spinner" />
    </div>
  );
};