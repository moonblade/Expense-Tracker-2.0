import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  // IconButton,
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
import { fetchPatterns, updatePattern, deletePattern, testPattern } from "./query.svc";
import PatternCreator from './PatternCreator';

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

const handleTestPattern = async () => {
    try {
      const trimmedPattern = selectedPattern.pattern.trim();
      handleFieldChange("pattern", trimmedPattern);
      let testPassed = false;
      const result = await testPattern(originalContent, trimmedPattern);
      setTestResult(result);
      testPassed = result.success;
      if (selectedPattern.action === "approve") {
        if (result.success && result.details.amount && result.details.merchant) {
          setSnackbarMessage("Test passed, amount: " + result.details.amount + " merchant: " + result.details.merchant);
          testPassed = true;
        } else {
          testPassed = false;
          if (!result.details.amount) {
            setSnackbarMessage("Test failed: Pattern must capture amount for approval.");
          }
          else if (!result.details.merchant) {
            setSnackbarMessage("Test failed: Pattern must capture payee for approval.");
          }
          else {
            setSnackbarMessage("Test failed: " + result.details.error);
          }
        }
      } else {
        testPassed = result.success;
        if (result.success) {
          setSnackbarMessage("Test passed");
        }
      }
      setSnackbarOpen(true);
      return testPassed;
    } catch (error) {
      setSnackbarMessage("Error testing pattern: " + error.message);
      setSnackbarOpen(true);
      return false;
    }
  };

  const handleSave = async () => {
    const isTestPassed = await handleTestPattern();
    const pattern = selectedPattern.pattern || "";
    const action = selectedPattern.action || "";

    if (originalContent && !isTestPassed) {
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

  // const handleBlockSender = async () => {
  //   try {
  //     const result = await testPattern(originalContent, ".*");
  //     if (result.success) {
  //       await updatePattern({
  //         ...selectedPattern,
  //         pattern: ".*",
  //         action: "reject",
  //       });
  //       handleDialogClose();
  //       fetchAndSetPatterns();
  //     } else {
  //       setSnackbarMessage("Failed to block sender. Test did not pass.");
  //       setSnackbarOpen(true);
  //     }
  //   } catch (error) {
  //     console.error("Error blocking sender:", error);
  //   }
  // };

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
            {selectedPattern.action === "approve" && (
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
            )}
            <Box display="flex" alignItems="center">
            <PatternCreator
              input={originalContent}
              approve={selectedPattern.action === "approve"}
              updatePattern={(pattern) => handleFieldChange("pattern", pattern)}
              handleTestPattern={handleTestPattern}
            />
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

