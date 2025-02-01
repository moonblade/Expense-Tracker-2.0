import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger icon
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from "@mui/icons-material/Message";
import BuildIcon from "@mui/icons-material/Build"; // New icon for Pattern
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"; // Icon for Transactions
import Senders from "./Senders";
import Messages from "./Messages"; // Import the Messages component
import LoginContext from "./LoginContext";
import Pattern from "./Pattern";
import Transactions from "./Transactions"; // Import the Transactions component

const drawerWidth = 240;

function MainContent() {
  const [drawerOpen, setDrawerOpen] = useState(() => {
    // Retrieve drawer state from localStorage, default to true if not set
    return localStorage.getItem("drawerOpen") === "true";
  });
  const [selectedComponent, setSelectedComponent] = useState(
    () => localStorage.getItem("selectedComponent") || "Senders"
  );
  const { user, login } = useContext(LoginContext);

  const handleNavigation = (component) => {
    setSelectedComponent(component);
    localStorage.setItem("selectedComponent", component); // Save to localStorage
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("drawerOpen", newState); // Save drawer state to localStorage
      return newState;
    });
  };

  useEffect(() => {
    const savedComponent = localStorage.getItem("selectedComponent");
    if (savedComponent) {
      setSelectedComponent(savedComponent);
    }
  }, []);

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100vw"
      >
        <Button variant="contained" color="primary" onClick={login}>
          Login
        </Button>
      </Box>
    );
  }

  return (
    <>
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
        <IconButton onClick={toggleDrawer}>
          <MenuIcon />
        </IconButton>
        <List>
          {/* Navigation Items */}
          {[
            { name: "Senders", icon: SendIcon },
            { name: "Messages", icon: MessageIcon },
            { name: "Patterns", icon: BuildIcon },
            { name: "Transactions", icon: MonetizationOnIcon }, // New Transactions item
          ].map((item) => (
            <ListItem disablePadding key={item.name}>
              <ListItemButton onClick={() => handleNavigation(item.name)}>
                <ListItemIcon>{item.icon ? <item.icon /> : null}</ListItemIcon>
                {drawerOpen && <ListItemText primary={item.name} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: (theme) =>
            theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        {selectedComponent === "Senders" && <Senders />}
        {selectedComponent === "Patterns" && <Pattern />}
        {selectedComponent === "Messages" && <Messages />}
        {selectedComponent === "Transactions" && <Transactions />} {/* New Transactions page */}
      </Box>
    </>
  );
}

export default MainContent;

