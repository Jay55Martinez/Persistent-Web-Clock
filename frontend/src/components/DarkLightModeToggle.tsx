import { useState, useEffect } from "react";
import { MdSunny } from "react-icons/md";
import { IoMoonOutline } from "react-icons/io5";

export function DarkLightModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or default to light
    const savedTheme = localStorage.getItem("selectedTheme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    // Apply the saved theme on mount
    const theme = isDark ? "dark" : "light";
    document.querySelector("body")?.setAttribute("data-theme", theme);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? "dark" : "light";
    document.querySelector("body")?.setAttribute("data-theme", newTheme);
    localStorage.setItem("selectedTheme", newTheme);
  };

  return (
    <div>
      <button className="pill-button" onClick={toggleTheme}>
        {isDark ? <IoMoonOutline /> : <MdSunny />}
      </button>
    </div>
  );
}
