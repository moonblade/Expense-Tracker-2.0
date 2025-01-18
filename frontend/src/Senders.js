import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { fetchSenders, updateSenderStatus } from "./query.svc";

const Senders = () => {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

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

  // Filter senders based on search input
  const filteredSenders = senders.filter((sender) =>
    sender.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort senders: Grey first (unprocessed), then Green (approved), Red (rejected)
  const sortedSenders = filteredSenders.sort((a, b) => {
    const order = ["unprocessed", "approved", "rejected"];
    return order.indexOf(a.status) - order.indexOf(b.status) || a.name.localeCompare(b.name);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Manage Senders
      </Typography>
      
      {/* Search bar */}
      <TextField
        label="Search Senders"
        variant="outlined"
        fullWidth
        onChange={(e) => setFilter(e.target.value)}
        margin="normal"
      />

      {/* Add space after the search bar */}
      <Box mb={2} />

      {/* Sender List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {sortedSenders.map((sender) => (
              <Grid item xs={12} sm={6} md={4} key={sender.name}>
                <Paper
                  elevation={3}
                  sx={{
                    backgroundColor:
                      sender.status === "unprocessed"
                        ? "#f0f0f0"
                        : sender.status === "approved"
                        ? "lightgreen"
                        : "lightcoral",
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color:
                        sender.status === "unprocessed"
                          ? "textPrimary"
                          : sender.status === "approved"
                          ? "green"
                          : "red",
                    }}
                  >
                    {sender.name}
                  </Typography>

                  {/* Action Buttons */}
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
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Senders;

