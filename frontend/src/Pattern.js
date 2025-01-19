import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchPatterns, updatePattern } from "./query.svc";
import Messages from "./Messages";

function Pattern() {
  const [patterns, setPatterns] = useState([]);
  const [filteredPatterns, setFilteredPatterns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      console.log("Pattern updated successfully");
      handleDialogClose();
      fetchAndSetPatterns();
    } catch (error) {
      console.error("Error updating pattern:", error);
    }
  };

  const handleDelete = () => {
    console.log("Deleting pattern:", selectedPattern);
    handleDialogClose();
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
      <Box>
        {filteredPatterns.map((pattern, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(pattern)}
            sx={{
              marginBottom: 2,
              borderLeft: `4px solid ${
                pattern.action === "approve" ? "green" : "red"
              }`,
              cursor: "pointer",
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {pattern.sender}
              </Typography>
              <Typography variant="body1">{pattern.name}</Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ fontFamily: "monospace" }}
              >
                {pattern.pattern}
              </Typography>
              {pattern.metadata && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  display="block"
                >
                  {JSON.stringify(pattern.metadata)}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
      <Messages />

      {/* Edit Dialog */}
      {selectedPattern && (
        <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth>
          <DialogTitle>Edit Pattern</DialogTitle>
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
            <Typography variant="subtitle1" gutterBottom>
              Metadata
            </Typography>
            {Object.entries(selectedPattern.metadata || {}).map(
              ([key, value], index) => (
                <Stack direction="row" spacing={2} mb={1} alignItems="center" key={index}>
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
                  <IconButton onClick={() => handleRemoveMetadata(key)}>
                    <Typography color="error">X</Typography>
                  </IconButton>
                </Stack>
              )
            )}
            <Button onClick={handleAddMetadata} color="primary">
              Add Metadata
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
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

