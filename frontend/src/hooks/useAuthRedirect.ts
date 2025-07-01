import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        navigate("/timer");
      }
    };

    checkAuthAndRedirect();
  }, [navigate, checkAuth]);
};

export default useAuthRedirect;
