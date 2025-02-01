import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Stack,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchPatterns, updatePattern } from "./query.svc";

function Pattern() {
  const [searchParams] = useSearchParams();
  const [patterns, setPatterns] = useState([]);
  const [filteredPatterns, setFilteredPatterns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleSave = async () => {
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
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Patterns
      </Typography>

      {/* Search */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, sender, or pattern"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
          fullWidth
        />
      </Stack>

      {/* Patterns List */}
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
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default Pattern;

