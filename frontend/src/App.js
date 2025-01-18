import React, { useState } from "react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
} from "@mui/material";
import Header from "./Header";
import { LoginProvider } from "./LoginContext";
import MainContent from "./MainContent";

function App() {
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  const [darkMode, setDarkMode] = useState(savedDarkMode);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginProvider>
        <Box sx={{ display: "flex" }}>
          {/* App Bar */}
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              transition: (theme) =>
                theme.transitions.create(["width", "margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
            }}
          >
            <Header toggleDarkMode={toggleDarkMode} />
          </AppBar>
          <MainContent />
        </Box>
      </LoginProvider>
    </ThemeProvider>
  );
}

export default App;

