import React from 'react';
import { logoutUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Navbar component - Used for navigating to different pages
const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser(); // Call API to clear server-side cookie
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    logout(); // Clear client-side state
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#eee' }}>
      {isLoggedIn ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </nav>
  );
};

export default Navbar;
