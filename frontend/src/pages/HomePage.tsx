import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import './pages.css'
// import useAuthRedirect from "../hooks/useAuthRedirect"; 

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <h1>Welcome to the Home Page</h1>
    </div>
  );
};

export default HomePage;
