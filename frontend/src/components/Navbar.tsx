import { logoutUser } from '../api/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {disconnectSocket } from "../utils/socket";
// Styling 
import './navbar.css';

// Navbar component - Used for navigating to different pages
const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnTimerPage = location.pathname === "/timer";

  const handleLogout = async () => {
    try {
      await logoutUser(); // Call API to clear server-side cookie
      disconnectSocket(); // Disconnect the socket
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    logout(); // Clear client-side state
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
        <a className="logo-text" style={{ paddingLeft: 15 }} href="/" >Tank Timer</a>
        <div id="button-container" className="d-flex gap-3" style={{ paddingRight: 15}}>
          <button onClick={navigateTimerOrHome} className='pill-button'>{isOnTimerPage ? "Home" : "Timer"}</button>
          {isLoggedIn ? (
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
