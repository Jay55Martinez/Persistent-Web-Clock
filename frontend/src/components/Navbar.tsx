import { useLocation, useNavigate } from 'react-router-dom';
import {disconnectSocket } from "../utils/socket";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../state/user/userSlice";
import type { AppDispatch, RootState } from "../state/store";
import { DarkLightModeToggle } from './DarkLightModeToggle';
// Styling 
import './navbar.css';

// Navbar component - Used for navigating to different pages
const Navbar = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnTimerPage = location.pathname === "/timer";

  const handleLogout = async () => {
    await dispatch(logout()); // Clear client-side state
    // wait some time
    disconnectSocket();
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1000ms
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const navigateTimerOrHome = async () => {
    navigate(isOnTimerPage ? '/' : '/timer');
  };

  return (
    <nav className='navbar navbar-expand-lg background'>
      <div id="navbar-elements" className="container-fluid">
        <a className="logo-text" style={{ paddingLeft: 15, paddingTop: 10 }} href="/" >tankTimer</a>
        <div id="button-container" className="d-flex gap-3" style={{ paddingRight: 15}}>
          <DarkLightModeToggle />
          <button onClick={navigateTimerOrHome} className='pill-button'>{isOnTimerPage ? "Home" : "Timer"}</button>
          {user.isLoggedIn ? (
            <button onClick={handleLogout} className='pill-button'>Logout</button>
          ) : (
            <button onClick={handleLogin} className='pill-button'>Login</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
