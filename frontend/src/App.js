import React, { useState } from "react";
import { CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Drawer } from "@mui/material";
import Header from "./Header";
import { LoginProvider } from "./LoginContext";
import Senders from "./Senders";

const drawerWidth = 240; // Width of the left navigation drawer

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
        <Box sx={{ display: "flex" }}>
          <Header toggleDarkMode={toggleDarkMode} />
          {/* Left Navigation Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
            }}
          >
            <Toolbar /> {/* This keeps the content below the AppBar */}
            <Box sx={{ overflow: "auto", padding: 2 }}>
              <Typography variant="h6">Navigation</Typography>
              {/* Add navigation items here */}
            </Box>
          </Drawer>

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              marginLeft: `${drawerWidth}px`,
            }}
          >
            <Toolbar /> {/* This pushes the content below the AppBar */}
            <Senders />
          </Box>
        </Box>
      </LoginProvider>
    </ThemeProvider>
  );
}

export default App;

