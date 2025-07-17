import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { connectSocket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
// styling
import './pages.css'

const HomePage = () => {
  const { authLoading, isLoggedIn } = useAuth();

  // Wait for auth check before rendering or connecting socket
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Establish socket connection once authentication state is known
  useEffect(() => {
    // console.log(isLoggedIn, authLoading);
    if (!authLoading && isLoggedIn) {
      const userId = sessionStorage.getItem('userId') ?? undefined;
      connectSocket(userId);
    }
  }, [authLoading, isLoggedIn]);

  return (
    <div>
      <Navbar />
      <h1>Welcome to the Home Page</h1>
    </div>
  );
};

export default HomePage;
