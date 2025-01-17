// Header.js
import React, { useState } from "react";
import { useLogin } from "./LoginContext";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Brightness4, Brightness7, AccountBalanceWallet } from "@mui/icons-material"; // Icon for wallet
import { useTheme } from "@mui/material/styles";

const Header = ({ toggleDarkMode }) => {
  const { user, login, logout } = useLogin();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu when user clicks their name
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Dark Mode Toggle */}
        <IconButton onClick={toggleDarkMode} color="inherit">
          {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

        {/* Logo and Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccountBalanceWallet sx={{ fontSize: 30, marginRight: 1 }} />
          <Typography variant="h6">Expense Tracker</Typography>
        </Box>

        {/* Login / User Dropdown */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <>
              <Button color="inherit" onClick={handleMenuOpen}>
                {user.displayName}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={login}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

