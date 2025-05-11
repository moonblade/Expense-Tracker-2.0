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
  Container,
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import { fetchPatterns, updatePattern, deletePattern, testPattern } from "./query.svc";

function Pattern() {
  const [searchParams] = useSearchParams();
  const [patterns, setPatterns] = useState([]);
  const [filteredPatterns, setFilteredPatterns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [testResultDialogOpen, setTestResultDialogOpen] = useState(false);
const [testResult, setTestResult] = useState({ success: false, details: {} });
const [isTestPassed, setIsTestPassed] = useState(false);
  
  const id = searchParams.get("id", null);
  let sender = searchParams.get("sender", null);
if (sender && sender.includes("-")) {
  sender = sender.split("-")[1];
}
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
        name: `pattern: ${sender}`,
        pattern: content,
        action: "approve",
        metadata: {
          account: sender,
        },
      });
      setOriginalContent(content);
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
        pattern.createdBy.toLowerCase().includes(query) ||
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
    setIsTestPassed(false);
  };

  const handleMetadataChange = (key, value) => {
    setSelectedPattern((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  // const handleAddMetadata = () => {
  //   setSelectedPattern((prev) => ({
  //     ...prev,
  //     metadata: { ...prev.metadata, "": "" },
  //   }));
  // };

  // const handleRemoveMetadata = (key) => {
  //   setSelectedPattern((prev) => {
  //     const newMetadata = { ...prev.metadata };
  //     delete newMetadata[key];
  //     return { ...prev, metadata: newMetadata };
  //   });
  // };

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

  const generateQuestion = (patternContent, action) => {
    return `You are an expert at regex, create a regex pattern to match the following string. Use .*? (dot star question mark) for any groups required, do not use complex regex patterns. Any parts that might change needs to use .*? pattern. The following groups should be definitely added in the regex

${action === "approve" ? `
This is a pattern for a payment transaction. The following groups should be definitely added in the regex:

  "amount" - amount spent or received
  "merchant" - who or what the amount was spent on
` : `
This is a pattern of rejecting messages that are not related to payments. So the regex should be simple enough to not get caught in technical issues.
So any number and link should be replaced with .*?
`}

The output should only have the regex and nothing else.
Do not add a backtick in the answer. only add the regex.

Input:

${patternContent}

Output:`;
  };

  const handleGeneratePattern = () => {
    const question = generateQuestion(selectedPattern.pattern || "", selectedPattern.action || "");
    const url = `https://chatgpt.com?q=${encodeURIComponent(question)}`;
    window.open(url, "_blank");
  };

const handleTestPattern = async () => {
    try {
      const trimmedPattern = selectedPattern.pattern.trim();
      handleFieldChange("pattern", trimmedPattern);
      const result = await testPattern(originalContent, trimmedPattern);
      setTestResult(result);
      setIsTestPassed(result.success);
      setTestResultDialogOpen(true);
    } catch (error) {
      console.error("Error testing pattern:", error);
    }
  };

  const handleClearPattern = () => {
    handleFieldChange("pattern", "");
  };

  const handleSave = async () => {
    const pattern = selectedPattern.pattern || "";
    const action = selectedPattern.action || "";

    if (originalContent && !isTestPassed) {
      setSnackbarMessage("Please test the pattern and ensure it passes before saving.");
      setSnackbarOpen(true);
      return;
    }

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
      selectedPattern.originalContent = originalContent;
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
              label="Pattern Name"
              value={selectedPattern.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Account Name"
              value={selectedPattern.metadata.account || ""}
              onChange={(e) => handleMetadataChange("account", e.target.value)}
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
            <FormControl fullWidth margin="dense">
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={selectedPattern.metadata.transactiontype || "debit"}
                onChange={(e) => handleMetadataChange("transactiontype", e.target.value)}
              >
                <MenuItem value="debit">Debit</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
              </Select>
            </FormControl>
            <Box display="flex" alignItems="center">
              <TextField
                label="Pattern"
                value={selectedPattern.pattern}
                onChange={(e) => handleFieldChange("pattern", e.target.value)}
                fullWidth
                margin="dense"
                multiline
                rows={3}
              />
              <Box display="flex" flexDirection="column">
                <IconButton onClick={handleGeneratePattern} aria-label="generate pattern">
                  <AutoAwesomeIcon />
                </IconButton>
                {originalContent && (
                  <>
                    <IconButton onClick={handleTestPattern} aria-label="test pattern">
                      <TaskAltIcon />
                    </IconButton>
                    <IconButton onClick={handleClearPattern} aria-label="clear pattern">
                      <CloseIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
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
      {/* Test Result Dialog */}
      <Dialog
        open={testResultDialogOpen}
        onClose={() => setTestResultDialogOpen(false)}
      >
        <DialogTitle>Test Result</DialogTitle>
        <DialogContent>
          <Typography>
            {testResult.success ? "Test Successful" : "Test Failed"}
          </Typography>
          {testResult.success && (
            <Box>
              {Object.entries(testResult.details).map(([key, value]) => (
                <Typography key={key}>
                  {key}: {value}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestResultDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Pattern;

