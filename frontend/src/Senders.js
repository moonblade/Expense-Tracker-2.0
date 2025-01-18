// Senders.js
import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchSenders, updateSenderStatus } from "./query.svc";

const Senders = () => {
  const [senders, setSenders] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch senders data
  useEffect(() => {
    const loadSenders = async () => {
      const data = await fetchSenders();
      setSenders(data);
      setLoading(false);
    };

    loadSenders();
  }, []);

  const handleStatusChange = async (name, status) => {
    const success = await updateSenderStatus(name, status);
    if (success) {
      setSenders((prevSenders) =>
        prevSenders.map((sender) =>
          sender.name === name ? { ...sender, status } : sender
        )
      );
    }
  };

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Sort senders: Grey first (unprocessed), then Green (approved), Red (rejected)
  const sortedSenders = senders.sort((a, b) => {
    const order = ["unprocessed", "approved", "rejected"];
    return order.indexOf(a.status) - order.indexOf(b.status) || a.name.localeCompare(b.name);
  });

  return (
    <Box display="flex">
      {/* Collapsible sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: isCollapsed ? 50 : "33.33%",
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            p: 2,
          }}
        >
          {!isCollapsed && (
            <Typography variant="h6" component="h3">
              Senders
            </Typography>
          )}
          <IconButton onClick={handleCollapseToggle}>
            {isCollapsed ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          </IconButton>
        </Box>
        <Divider />

        {/* Sender List */}
        {!isCollapsed && (
          <Box sx={{ overflowY: "auto", p: 2, flex: 1 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {sortedSenders.map((sender) => (
                  <ListItem
                    key={sender.name}
                    sx={{
                      backgroundColor:
                        sender.status === "unprocessed"
                          ? "#f0f0f0"
                          : sender.status === "approved"
                          ? "lightgreen"
                          : "lightcoral",
                      mb: 1,
                      borderRadius: 2,
                      fontWeight: "bold",
                    }}
                  >
                    <ListItemText
                      primary={sender.name}
                      primaryTypographyProps={{
                        color:
                          sender.status === "unprocessed"
                            ? "textPrimary"
                            : sender.status === "approved"
                            ? "green"
                            : "red",
                        fontWeight: "bold",
                      }}
                    />
                    <Box>
                      <IconButton
                        onClick={() => handleStatusChange(sender.name, "approved")}
                        color="success"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusChange(sender.name, "rejected")}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>

      {/* Main content area */}
      <Box
        sx={{
          width: isCollapsed ? "100%" : "66.67%",
          p: 2,
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Main Content Area
        </Typography>
        {/* Add additional content here */}
      </Box>
    </Box>
  );
};

export default Senders;

