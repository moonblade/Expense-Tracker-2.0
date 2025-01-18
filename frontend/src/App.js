// App.js
import React, { useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Header from "./Header";
import { LoginProvider } from "./LoginContext";
import Senders from "./Senders";

function App() {
  // Load dark mode preference from localStorage or default to true (dark mode)
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  const [darkMode, setDarkMode] = useState(savedDarkMode);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light", // Toggle dark/light mode
    },
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode); // Save to localStorage
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS for dark/light theme */}
      <LoginProvider>
        <div className="App">
          <Header toggleDarkMode={toggleDarkMode} />
          <main>
            <Senders />
          </main>
        </div>
      </LoginProvider>
    </ThemeProvider>
  );
}

export default App;

