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
} from "@mui/material";
import { fetchMessages } from "./query.svc";
import SearchIcon from "@mui/icons-material/Search";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchAndSetMessages = async () => {
      const data = await fetchMessages();
      setMessages(data.messages || []);
      setFilteredMessages(data.messages || []);
    };

    fetchAndSetMessages();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterMessages(query, filterStatus);
  };

  const handleFilterChange = (event) => {
    const status = event.target.value;
    setFilterStatus(status);
    filterMessages(searchQuery, status);
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

