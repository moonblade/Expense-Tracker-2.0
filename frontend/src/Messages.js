import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Fab,
} from "@mui/material";
import { fetchMessages, processMessages } from "./query.svc";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";

const FILTER_STATUS_KEY = "messages_filterStatus";

function Messages({ onMessageClick }) {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(localStorage.getItem(FILTER_STATUS_KEY) || "all");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAndSetMessages = async () => {
      const data = await fetchMessages();
      setMessages(data.messages || []);
      let updatedMessages = data.messages;
      if (filterStatus !== "all") {
        updatedMessages = updatedMessages.filter(
          (msg) => msg.status.toLowerCase() === filterStatus
        );
      }
      setFilteredMessages(updatedMessages || []);
    };

    fetchAndSetMessages();
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem(FILTER_STATUS_KEY, filterStatus);
    filterMessages(searchQuery, filterStatus);
  }, [filterStatus]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterMessages(query, filterStatus);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filterMessages = (query, status) => {
    let updatedMessages = messages;

    if (status !== "all") {
      updatedMessages = updatedMessages.filter(
        (msg) => msg.status.toLowerCase() === status
      );
    }

    if (query) {
      updatedMessages = updatedMessages.filter(
        (msg) =>
          msg.sender.toLowerCase().includes(query) ||
          msg.sms.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(updatedMessages);
  };

  const handleProcessMessages = async () => {
    setIsProcessing(true);
    try {
      const result = await processMessages();
      if (result.status === "success") {
        const refreshedData = await fetchMessages();
        setMessages(refreshedData.messages || []);
        let updatedMessages = refreshedData.messages;
        if (filterStatus !== "all") {
          updatedMessages = updatedMessages.filter(
            (msg) => msg.status.toLowerCase() === filterStatus
          );
        }
        setFilteredMessages(updatedMessages || []);
      } else {
        console.error("Failed to process messages:", result.error);
      }
    } catch (error) {
      console.error("Error processing messages:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Messages
        </Typography>
      </Grid>

      <Grid item xs={12} sm={8}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by sender or content"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <FormControl size="small" fullWidth>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            label="Filter Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="matched">Matched</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="unprocessed">Unprocessed</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        {isProcessing ? (
          <CircularProgress />
        ) : (
          <List>
            {filteredMessages.map((msg, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    borderLeft: `4px solid ${
                      msg.status === "rejected"
                        ? "red"
                        : msg.status === "matched"
                        ? "green"
                        : "grey"
                    }`,
                    cursor: onMessageClick ? "pointer" : "default",
                  }}
                  onClick={() => onMessageClick && onMessageClick(msg)}
                >
                  <ListItemText
                    primary={msg.sender}
                    secondary={msg.sms}
                    secondaryTypographyProps={{
                      variant: "body2",
                      color: "textSecondary",
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Grid>

      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
        <Fab
          color="primary"
          onClick={handleProcessMessages}
          disabled={isProcessing}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <SyncIcon />
        </Fab>
      </Grid>
    </Grid>
  );
}

export default Messages;

