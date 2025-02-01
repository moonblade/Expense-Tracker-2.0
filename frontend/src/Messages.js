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
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchMessages, processMessages } from "./query.svc";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";

const FILTER_STATUS_KEY = "messages_filterStatus";

function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState(localStorage.getItem(FILTER_STATUS_KEY) || "all");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMessageClick = (msg) => {
    if (msg.matchedPattern && msg.matchedPattern !== "") {
      // If matchedPattern is non-empty, navigate to /patterns with id as matchedPattern
      navigate(`/patterns?id=${msg.matchedPattern}`);
    } else if (msg.status !== "unprocessed") {
      // If status is not "unprocessed", navigate to /senders page with sender's last part
      const senderId = msg.sender.split("-").pop(); // get the last part after the last dash
      navigate(`/senders?search=${senderId}`);
    }
  };

  const fetchAndSetMessages = async () => {
    const data = await fetchMessages();
    setMessages(data.messages || []);
  };

  useEffect(() => {
    fetchAndSetMessages();
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem(FILTER_STATUS_KEY, filterStatus);
    filterMessages(searchQuery, filterStatus);
  }, [filterStatus, searchQuery, messages]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setSearchParams({ search: query });
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
          msg.sender.toLowerCase().includes(query.toLowerCase()) ||
          msg.sms.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredMessages(updatedMessages);
  };

  const handleProcessMessages = async () => {
    setIsProcessing(true);
    try {
      const result = await processMessages();
      if (result.status === "success") {
        fetchAndSetMessages();
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
                    cursor: handleMessageClick ? "pointer" : "default",
                  }}
                  onClick={() => handleMessageClick(msg)}
                >
                 <ListItemText
                    primary={msg.sender}
                    secondary={
                      <>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(msg.timestamp * 1000).toLocaleString("en-IN", {
                            hour12: true,
                            hour: "numeric",
                            minute: "numeric",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </Typography>
                        <br />
                        {msg.sms}
                      </>
                    }
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

