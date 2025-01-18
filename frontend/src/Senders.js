// Senders.js
import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, IconButton, Box } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchSenders, updateSenderStatus } from './query.svc';

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
  const sortedSenders = senders
    .sort((a, b) => {
      const order = ["unprocessed", "approved", "rejected"];
      return order.indexOf(a.status) - order.indexOf(b.status) || a.name.localeCompare(b.name);
    });

  return (
    <Box display="flex">
      {/* Collapsible sidebar */}
      <Box
        sx={{
          width: isCollapsed ? 50 : "33.33%",
          transition: "width 0.3s",
          borderRight: "1px solid #ccc",
        }}
      >
        <IconButton onClick={handleCollapseToggle} sx={{ position: "absolute", top: 20, right: isCollapsed ? 0 : 50 }}>
          {isCollapsed ? <ArrowForwardIcon /> : <ArrowBackIcon />}
        </IconButton>
        {!isCollapsed && (
          <Box sx={{ padding: 2 }}>
            <h3>Senders</h3>
          </Box>
        )}
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          width: isCollapsed ? "100%" : "66.67%",
          padding: 2,
        }}
      >
        {loading ? (
          <p>Loading...</p>
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
                  marginBottom: 1,
                  borderRadius: 2,
                  fontWeight: "bold", // Make text bold
                  color:
                    sender.status === "unprocessed"
                      ? "black"
                      : sender.status === "approved"
                      ? "darkgreen"
                      : "darkred", // High contrast colors
                }}
              >
                <ListItemText primary={sender.name} />
                <Box>
                  <IconButton
                    onClick={() => handleStatusChange(sender.name, "approved")}
                    sx={{ color: "green" }}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleStatusChange(sender.name, "rejected")}
                    sx={{ color: "red" }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default Senders;

