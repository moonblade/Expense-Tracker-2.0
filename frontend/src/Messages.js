import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
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
import SyncIcon from "@mui/icons-material/Sync";
import ClearIcon from "@mui/icons-material/Clear";

const FILTER_STATUS_KEY = "messages_filterStatus";

function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState(localStorage.getItem(FILTER_STATUS_KEY) || "all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(searchParams.get("id") || null);

  useEffect(() => {
    setSelectedMessageId(searchParams.get("id") || null);
  }, [searchParams]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setSearchParams({});
    setSelectedMessageId(null);
  };

  const handleMessageClick = (msg) => {
    if (msg.matchedPattern && msg.matchedPattern !== "") {
      // If matchedPattern is non-empty, navigate to /patterns with id as matchedPattern
      navigate(`/patternsui?id=${encodeURIComponent(msg.matchedPattern)}`);
    } else if (msg.status !== "unprocessed") {
      // If status is not "unprocessed", navigate to /senders page with sender's last part
      const senderId = msg.sender.split("-").pop(); // get the last part after the last dash
      navigate(`/sendersui?search=${senderId}`);
    } else if (msg.status === "unprocessed") {
      // If status is "unprocessed", navigate to /patterns page
      navigate(`/patternsui?sender=${encodeURIComponent(msg.sender)}&content=${encodeURIComponent(msg.sms)}`);
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
    const filterMessages = (query, status, messageId) => {
      let updatedMessages = messages;

      if (messageId) {
        updatedMessages = updatedMessages.filter(msg => msg.id === messageId);
      } else {
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
      }

      setFilteredMessages(updatedMessages);
    };
    localStorage.setItem(FILTER_STATUS_KEY, filterStatus);
    filterMessages(searchQuery, filterStatus, selectedMessageId);
  }, [filterStatus, searchQuery, messages, selectedMessageId]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setSearchParams({ search: query });
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
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
    <Container>
      <Typography variant="h5" gutterBottom>
        Messages
      </Typography>

      <FormControl size="small" fullWidth sx={{mb:2}}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by sender or content"
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
          InputProps={{
            endAdornment: (
              <>
                {(searchQuery || filterStatus !== "all" || selectedMessageId) && (
                  <ClearIcon
                    onClick={handleClearFilters}
                    sx={{ cursor: "pointer", marginRight: 1 }}
                  />
                )}
              </>
            ),
          }}
        />
      </FormControl>

      <FormControl size="small" fullWidth sx={{mb:2}}>
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


      <Box sx={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
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
        </Box>

        <Fab
          color="primary"
          onClick={handleProcessMessages}
          disabled={isProcessing}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <SyncIcon />
        </Fab>
    </Container>
  );
}

export default Messages;

