import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { fetchSenders, updateSenderStatus } from "./query.svc";

const Senders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('search') || '');


  const navigate = useNavigate();

  // Fetch senders data when the component mounts
  useEffect(() => {
    const loadSenders = async () => {
      const data = await fetchSenders();
      setSenders(data);
      setLoading(false);
    };

    loadSenders();
  }, []);

  // Modified navigation function to accept a sender name as parameter
  const handleNavigateToMessages = (senderName) => {
    // Pass the sender name as a query parameter (adjust as needed for your routing)
    console.log("Navigating to messages for sender:", senderName);
    navigate(`/messages?search=${encodeURIComponent(senderName)}`);
  };

  // Handle status change for a sender
  const handleStatusChange = async (name, newStatus) => {
    const success = await updateSenderStatus(name, newStatus);
    if (success) {
      setSenders((prevSenders) =>
        prevSenders.map((sender) =>
          sender.name === name ? { ...sender, status: newStatus } : sender
        )
      );
    }
  };

  useEffect(() => {
    if (filter) {
      setSearchParams({ search: filter });
    } else {
      setSearchParams({});
    }
  }, [filter, setSearchParams]);

  // Filter senders based on search input
  const filteredSenders = useMemo(
    () =>
      senders.filter((sender) =>
        sender.name.toLowerCase().includes(filter.toLowerCase())
      ),
    [senders, filter]
  );

  // Group senders by status in the order: unprocessed, approved, rejected
  const groupOrder = useMemo(()=> { return ["unprocessed", "approved", "rejected"]; }, [])
  const groupedSenders = useMemo(() => {
    const groups = {};
    groupOrder.forEach((status) => {
      groups[status] = [];
    });
    filteredSenders.forEach((sender) => {
      const { status } = sender;
      if (groups[status]) {
        groups[status].push(sender);
      } else {
        groups[status] = [sender];
      }
    });
    // Optionally, sort each group alphabetically by name
    groupOrder.forEach((status) => {
      groups[status].sort((a, b) => a.name.localeCompare(b.name));
    });
    return groups;
  }, [filteredSenders, groupOrder]);

  return (
    <Container>
      <Typography variant="h5" component="h2" gutterBottom>
        Senders
      </Typography>

      {/* Search bar */}
      <TextField
        label="Search Senders"
        variant="outlined"
        fullWidth
        margin="normal"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <Box sx={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {groupOrder.map((status) => (
              <React.Fragment key={status}>
                {
                  groupedSenders[status].length > 0 && (
                  <ListSubheader
                    sx={{
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </ListSubheader>)
                }
                {groupedSenders[status] && groupedSenders[status].length > 0 && (
                  groupedSenders[status].map((sender) => (
                    <React.Fragment key={sender.name}>
                      <ListItem
                        onClick={() => handleNavigateToMessages(sender.name)}
                        secondaryAction={
                          <Box>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(sender.name, "approved");
                              }}
                              color="success"
                              disabled={sender.status === "approved"}
                              size="large"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(sender.name, "rejected");
                              }}
                              color="error"
                              disabled={sender.status === "rejected"}
                              size="large"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={sender.name}
                          primaryTypographyProps={{
                            color:
                              sender.status === "approved"
                                ? "green"
                                : sender.status === "rejected"
                                ? "red"
                                : "textPrimary",
                          }}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default Senders;

