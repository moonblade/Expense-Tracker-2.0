import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  Container,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchPatterns, updatePattern, deletePattern } from "./query.svc";

function Pattern() {
  const [searchParams] = useSearchParams();
  const [patterns, setPatterns] = useState([]);
  const [filteredPatterns, setFilteredPatterns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const id = searchParams.get("id", null);
  const sender = searchParams.get("sender", null);
  const content = searchParams.get("content", null);

  const fetchAndSetPatterns = async () => {
    try {
      const data = await fetchPatterns();
      setPatterns(data.patterns || []);
      setFilteredPatterns(data.patterns || []);
    } catch (error) {
      console.error("Error fetching patterns:", error);
    }
  };

  useEffect(() => {
    fetchAndSetPatterns();
  }, []);

  // If the 'id' parameter is available in the URL, automatically select that pattern
  useEffect(() => {
    if (id) {
      const pattern = patterns.find((pattern) => pattern.id === id);
      if (pattern) {
        handleCardClick(pattern);
      }
    }
  }, [id, patterns]);

  useEffect(() => {
    if (sender && content) {
      setSelectedPattern({
        sender,
        pattern: content,
        action: "approve",
        metadata: {},
      });
      setIsDialogOpen(true);
    }
  }, [sender, content]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterPatterns(query);
  };

  const filterPatterns = (query) => {
    const updatedPatterns = patterns.filter(
      (pattern) =>
        pattern.name.toLowerCase().includes(query) ||
        pattern.sender.toLowerCase().includes(query) ||
        pattern.pattern.toLowerCase().includes(query)
    );
    setFilteredPatterns(updatedPatterns);
  };

  const handleCardClick = (pattern) => {
    setSelectedPattern({ ...pattern }); // Clone the pattern to avoid direct mutation
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPattern(null);
  };

  const handleFieldChange = (field, value) => {
    setSelectedPattern((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (key, value) => {
    setSelectedPattern((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  const handleAddMetadata = () => {
    setSelectedPattern((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, "": "" },
    }));
  };

  const handleRemoveMetadata = (key) => {
    setSelectedPattern((prev) => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[key];
      return { ...prev, metadata: newMetadata };
    });
  };

// You are an expert at regex, create a regex pattern to match the following string. Use .*? for any groups required, do not use complex regex patterns. Any parts that might change needs to use .*? pattern. The following groups should be definitely added in the regex
//
// "amount" - amount spent or received
// "merchant" - who or what the amount was spent on
//
// If existing, the following groups can also be added
// "balance" - current balance
// "date" - date of payment
//
// The output should only have the regex and nothing else.
//
// Input:
//
// {input}
//
// Output:

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deletePattern(selectedPattern.id);
      console.log("Pattern deleted successfully");
      handleDialogClose();
      fetchAndSetPatterns();
    } catch (error) {
      console.error("Error deleting pattern:", error);
    }
  };

  const handleSave = async () => {
    const pattern = selectedPattern.pattern || "";
    const action = selectedPattern.action || "";

    if (!pattern.includes(".*")) {
      setSnackbarMessage("Pattern must contain at least one '.*'");
      setSnackbarOpen(true);
      return;
    }

    if (action === "approve" && (!pattern.includes("?P<amount>") || !pattern.includes("?P<merchant>"))) {
      setSnackbarMessage("Pattern must contain '?P<amount>' and '?P<merchant>' for approval");
      setSnackbarOpen(true);
      return;
    }

    try {
      await updatePattern(selectedPattern);
      console.log("Pattern saved successfully");
      handleDialogClose();
      fetchAndSetPatterns();
    } catch (error) {
      console.error("Error saving pattern:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Patterns
      </Typography>

      {/* Search */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search by name, sender, or pattern"
        value={searchQuery}
        onChange={handleSearch}
        fullWidth
      />

      <Box sx={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
      <List>
        {filteredPatterns.map((pattern, index) => (
          <React.Fragment key={index}>
            <ListItem
              onClick={() => handleCardClick(pattern)}
              sx={{
                borderLeft: `4px solid ${
                  pattern.action === "approve" ? "green" : "red"
                }`,
              }}
            >
              <ListItemText
                disableTypography
                primary={pattern.name}
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      {pattern.sender}
                    </Typography>
                    <Typography variant="body2" style={{ fontFamily: "monospace" }}>
                      {pattern.pattern}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {Object.entries(pattern.metadata || {})
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      </Box>

      {/* Edit/Add Dialog */}
      {selectedPattern && (
        <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>{selectedPattern.name ? "Edit Pattern" : "Add Pattern"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={selectedPattern.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Pattern"
              value={selectedPattern.pattern}
              onChange={(e) => handleFieldChange("pattern", e.target.value)}
              fullWidth
              margin="dense"
              multiline
              rows={3}
            />
            <TextField
              label="Sender"
              value={selectedPattern.sender}
              onChange={(e) => handleFieldChange("sender", e.target.value)}
              fullWidth
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Action</InputLabel>
              <Select
                value={selectedPattern.action}
                onChange={(e) => handleFieldChange("action", e.target.value)}
              >
                <MenuItem value="approve">Approve</MenuItem>
                <MenuItem value="reject">Reject</MenuItem>
              </Select>
            </FormControl>
           <List disablePadding>
              {Object.entries(selectedPattern.metadata || {}).map(
                ([key, value], index) => (
                  <ListItem
                    disableGutters
                    sx={{ paddingRight: 2, py: 0 }}
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveMetadata(key)}
                      >
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    }
                  >
                    <TextField
                      label="Key"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        handleRemoveMetadata(key);
                        handleMetadataChange(newKey, value);
                      }}
                      fullWidth
                      margin="dense"
                    />
                    <TextField
                      label="Value"
                      value={value}
                      onChange={(e) => handleMetadataChange(key, e.target.value)}
                      fullWidth
                      margin="dense"
                    />
                  </ListItem>
                )
              )}
            </List> 

            <ListItemButton onClick={handleAddMetadata}>
              <ListItemText primary="Add Metadata" />
            </ListItemButton>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={() => setIsDeleteDialogOpen(true)} color="secondary">
              Delete
            </Button>
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this pattern?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDelete();
              setIsDeleteDialogOpen(false);
            }}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Pattern;

