// Header.js
import React, { useState } from "react";
import { useLogin } from "./LoginContext";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Brightness4, Brightness7, AccountBalanceWallet, Settings } from "@mui/icons-material"; // Add settings icon
import { useTheme } from "@mui/material/styles";

const Header = ({ toggleDarkMode }) => {
  const { user, login, logout } = useLogin();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElSettings, setAnchorElSettings] = useState(null);
  const theme = useTheme();

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget); // Open user menu when clicked
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null); // Close user menu
  };

  const handleSettingsMenuOpen = (event) => {
    setAnchorElSettings(event.currentTarget); // Open settings menu when clicked
  };

  const handleSettingsMenuClose = () => {
    setAnchorElSettings(null); // Close settings menu
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo and Title moved to the left */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccountBalanceWallet sx={{ fontSize: 30, marginRight: 1 }} />
          <Typography variant="h6">Expense Tracker</Typography>
        </Box>

        {/* Login / User Dropdown */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <>
              <Button color="inherit" onClick={handleUserMenuOpen}>
                {user.displayName}
              </Button>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={login}>
              Login
            </Button>
          )}

          {/* Settings Icon with Dark/Light Mode Toggle */}
          <IconButton onClick={handleSettingsMenuOpen} color="inherit">
            <Settings />
          </IconButton>
          <Menu
            anchorEl={anchorElSettings}
            open={Boolean(anchorElSettings)}
            onClose={handleSettingsMenuClose}
          >
            <MenuItem onClick={toggleDarkMode}>
              <IconButton color="inherit">
                {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
                {theme.palette.mode === "dark" ? "Light" : "Dark"} Mode
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

