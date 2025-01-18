import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
} from "@mui/material";
import { fetchMessages, processMessages } from "./query.svc";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync"; // Use this as a "Process Messages" icon.

const FILTER_STATUS_KEY = "messages_filterStatus";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(localStorage.getItem(FILTER_STATUS_KEY) || "all");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Retrieve filter status from local storage
    const savedFilterStatus = localStorage.getItem(FILTER_STATUS_KEY);
    if (savedFilterStatus) {
      setFilterStatus(savedFilterStatus);
    }

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
  }, []);

  useEffect(() => {
    // Save the filter status to local storage whenever it changes
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
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Messages
      </Typography>

      {/* Search and Filter */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
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

        <FormControl size="small" sx={{ minWidth: 150 }}>
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

        {/* Process Messages Button */}
        <IconButton
          onClick={handleProcessMessages}
          color="primary"
          disabled={isProcessing}
          title="Process Messages"
        >
          <SyncIcon />
        </IconButton>
      </Stack>

      {/* Messages List */}
      <Box>
        {filteredMessages.map((msg, index) => (
          <Card
            key={index}
            sx={{
              marginBottom: 2,
              borderLeft: `4px solid ${
                msg.status === "rejected"
                  ? "red"
                  : msg.status === "matched"
                  ? "green"
                  : "grey"
              }`,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                {msg.sender}
              </Typography>
              <Typography variant="body1">{msg.sms}</Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                {new Date(msg.timestamp * 1000).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default Messages;

