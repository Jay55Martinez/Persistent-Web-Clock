import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// global theme (CSS variables, color tokens)
import './styles/theme.css'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { Provider } from "react-redux";
import { store } from "./state/store";

// Initialize theme from localStorage before React renders
const savedTheme = localStorage.getItem("selectedTheme");
if (savedTheme === "dark") {
  document.querySelector("body")?.setAttribute("data-theme", "dark");
} else {
  document.querySelector("body")?.setAttribute("data-theme", "light");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
