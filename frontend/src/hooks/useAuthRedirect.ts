import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../state/user/userSlice";
import type { AppDispatch, RootState } from "../state/store";

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      await dispatch(checkAuth());
      if (isLoggedIn) {
        navigate("/timer");
      }
    };

    checkAuthAndRedirect();
  }, [navigate, dispatch, isLoggedIn]);
};

export default useAuthRedirect;
