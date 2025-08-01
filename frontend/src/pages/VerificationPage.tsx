import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verify, resendVerification } from "../state/user/userSlice";
import type { AppDispatch, RootState } from "../state/store";

const VerificationPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [token, setToken] = useState("");
  const navigate = useNavigate();


  const handleVerify = async () => {
    const emailToVerify = user.email
    if (emailToVerify) {
      await dispatch(verify({ email: emailToVerify, code: token }));
      navigate("/timer");
    }
    else {
      alert("Email is GONEEE!")
    }
  };

  const handleResendVerification = async () => {
    const emailToResend = user.email;
    if (emailToResend) {
      await dispatch(resendVerification(emailToResend));
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