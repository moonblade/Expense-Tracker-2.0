import React, { useState } from "react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "./Header";
import { LoginProvider } from "./LoginContext";
import Senders from "./Senders";

const drawerWidth = 240;

function App() {
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  const [darkMode, setDarkMode] = useState(savedDarkMode);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState("Senders");

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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (component) => {
    setSelectedComponent(component);
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
              ...(drawerOpen && {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: (theme) =>
                  theme.transitions.create(["width", "margin"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
              }),
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, ...(drawerOpen && { display: "none" }) }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                My App
              </Typography>
              <Header toggleDarkMode={toggleDarkMode} />
            </Toolbar>
          </AppBar>

          {/* Drawer */}
          <Drawer
            variant="permanent"
            open={drawerOpen}
            sx={{
              width: drawerOpen ? drawerWidth : 56,
              flexShrink: 0,
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              "& .MuiDrawer-paper": {
                width: drawerOpen ? drawerWidth : 56,
                overflowX: "hidden",
                transition: (theme) =>
                  theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                ...(drawerOpen
                  ? {}
                  : {
                      transition: (theme) =>
                        theme.transitions.create("width", {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.leavingScreen,
                        }),
                    }),
              },
            }}
          >
            <Toolbar />
            <List>
              {/* Senders Navigation Item */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation("Senders")}>
                  <ListItemIcon>
                    <SendIcon />
                  </ListItemIcon>
                  {drawerOpen && <ListItemText primary="Senders" />}
                </ListItemButton>
              </ListItem>

              {/* Reject Pattern Navigation Item */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation("RejectPattern")}>
                  <ListItemIcon>
                    <CancelIcon />
                  </ListItemIcon>
                  {drawerOpen && <ListItemText primary="Reject Patterns" />}
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              marginLeft: drawerOpen ? `${drawerWidth}px` : "56px",
              transition: (theme) =>
                theme.transitions.create("margin-left", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            }}
          >
            <Toolbar />
            {selectedComponent === "Senders" && <Senders />}
            {selectedComponent === "RejectPattern" && (
              <Box>
                <Typography variant="h5">Reject Patterns</Typography>
                {/* Add more content for Reject Pattern here in the future */}
              </Box>
            )}
          </Box>
        </Box>
      </LoginProvider>
    </ThemeProvider>
  );
}

export default App;

