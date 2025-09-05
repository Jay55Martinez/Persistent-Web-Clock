import Navbar from "../components/Navbar";
import ParticlesBackground from "../components/ParticlesBackground";
// styling
import './pages.css'

const HomePage = () => {
  return (
    <div className="page-root">
      <Navbar />
      <div className="background-root">
        <ParticlesBackground particleCount={70} lineDistance={110} opacity={0.6} />
      </div>
      <main className="home-content centered-element">
        <h1 className="center-logo">tankTimer</h1>
        <p className="tagline">A Timer For All Your Devices</p>
      </main>
    </div>
  );
};

export default HomePage;