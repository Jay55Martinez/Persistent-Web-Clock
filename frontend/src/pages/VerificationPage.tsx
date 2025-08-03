import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verify, resendVerification } from "../state/user/userSlice";
import type { AppDispatch } from "../state/store";

const VerificationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const emailToVerify = localStorage.getItem("verifyEmail")

  const handleVerify = async () => {
    if (emailToVerify) {
      await dispatch(verify({ email: emailToVerify, code: token }));
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1000ms
      localStorage.removeItem("verifyEmail")
      navigate("/timer");
    }
    else {
      alert("Email is GONEEE!")
    }
  };

  const handleResendVerification = async () => {
    if (emailToVerify) {
      await dispatch(resendVerification(emailToVerify));
      alert("Verification code resent. Please check your email.");
    }
    else {
      alert("Email is GONEEE!")
    }
  };

  return (
    <div>
      <h1>Verification Page</h1>
      <input type="number" value={token} onChange={(e) => setToken(e.target.value)} />
      <button onClick={handleVerify}>Verify</button>
      <button onClick={handleResendVerification}>Resend Verification Code</button>
    </div>
  );
};

export default VerificationPage;