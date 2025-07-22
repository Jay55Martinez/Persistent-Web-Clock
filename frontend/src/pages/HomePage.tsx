import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { connectSocket } from "../utils/socket";
import type { RootState } from "../state/store";
import { useSelector } from "react-redux";
// styling
import './pages.css'

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user);

  // Establish socket connection once authentication state is known
  useEffect(() => {
    console.log(user);
    if (user.isLoggedIn) {
      connectSocket(user.id);
    }
  }, [user]);

  return (
    <div>
      <Navbar />
      <h1>Welcome to the Home Page</h1>
    </div>
  );
};

export default HomePage;
