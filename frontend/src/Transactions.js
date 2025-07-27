import React, { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Fab,
  Container,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ChecklistIcon from '@mui/icons-material/Checklist';
import SyncIcon from "@mui/icons-material/Sync";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import NotesIcon from "@mui/icons-material/Notes";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Import Material-UI icons dynamically
import * as MuiIcons from '@mui/icons-material';
import {
  HelpOutline as UncategorizedIcon,
} from "@mui/icons-material";

// Service functions for transactions and categories
import {
  addTransaction,
  addTransactionReason,
  categorizeTransaction,
  fetchTransactions,
  ignoreTransaction,
  processMessages,
  unignoreTransaction,
  fetchCategories, // Add this import
} from "./query.svc";

// Predefined date range options
const predefinedRanges = [
  { label: "L-Week", value: "last_week" },
  { label: "C-Week", value: "current_week" },
  { label: "L-Month", value: "last_month" },
  { label: "C-Month", value: "current_month" },
  { label: "L-Year", value: "last_year" },
  { label: "C-Year", value: "current_year" },
  { label: "Custom", value: "custom" },
];

// A unified Date Range Picker component
function DateRangePicker({ fromDate, toDate, setFromDate, setToDate }) {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("current_month");
  const [customFrom, setCustomFrom] = useState(fromDate);
  const [customTo, setCustomTo] = useState(toDate);

  useEffect(() => {
    if (selectedOption === "custom") {
      setCustomFrom(fromDate);
      setCustomTo(toDate);
    }
  }, [open, fromDate, toDate, selectedOption]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (option !== "custom") {
      let start, end;
      switch (option) {
        case "last_week":
          start = moment().subtract(1, "week").startOf("week");
          end = moment().subtract(1, "week").endOf("week");
          break;
        case "current_week":
          start = moment().startOf("week");
          end = moment().endOf("week");
          break;
        case "last_month":
          start = moment().subtract(1, "month").startOf("month");
          end = moment().subtract(1, "month").endOf("month");
          break;
        case "current_month":
          start = moment().startOf("month");
          end = moment().endOf("month");
          break;
        case "last_year":
          start = moment().subtract(1, "year").startOf("year");
          end = moment().subtract(1, "year").endOf("year");
          break;
        case "current_year":
          start = moment().startOf("year");
          end = moment().endOf("year");
          break;
        default:
          start = moment();
          end = moment();
      }
      setFromDate(start.toDate());
      setToDate(end.toDate());
      setOpen(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customFrom && customTo) {
      setFromDate(customFrom.toDate());
      setToDate(customTo.toDate());
      setOpen(false);
    }
  };

  return (
    <div>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {
          predefinedRanges.find((r) => r.value === selectedOption)?.label ||
          "Select Date Range"
        }
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <List>
            {predefinedRanges.map((range) => (
              <ListItem
                key={range.value}
                onClick={() => handleOptionSelect(range.value)}
              >
                <ListItemText primary={range.label} />
              </ListItem>
            ))}
          </List>
          {selectedOption === "custom" && (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <DatePicker
                  label="From Date"
                  value={customFrom}
                  onChange={(newValue) => setCustomFrom(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
                <DatePicker
                  label="To Date"
                  value={customTo}
                  onChange={(newValue) => setCustomTo(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </Stack>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCustomSubmit}>Apply</Button>
              </DialogActions>
            </LocalizationProvider>
          )}
        </DialogContent>
        {selectedOption !== "custom" && (
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}

const filterTypes = ["credit", "debit"];

function Transactions() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // Add categories state
  const [categoryIcons, setCategoryIcons] = useState({}); // Dynamic category icons
  const [categoryColors, setCategoryColors] = useState({}); // Dynamic category colors
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("debit");
  const [ignoreFilter, setIgnoreFilter] = useState("active");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    merchant: '',
    date: moment().toDate()
  });
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  // Default date range: Current Month
  const [fromDate, setFromDate] = useState(moment().startOf("month").toDate());
  const [toDate, setToDate] = useState(moment().endOf("month").toDate());

  // Helper function to get category icon
  const getCategoryIcon = (iconName, colorHex, noInvert = true) => {
    // Get the MUI icon component name
    const muiIconName = iconName;
    
    // Dynamically get the icon component from MuiIcons
    let IconComponent = MuiIcons[muiIconName];
    if (!IconComponent) {
      // If the icon doesn't exist, fallback to UncategorizedIcon
      IconComponent = UncategorizedIcon;
    }
    
    let iconProps = {
      style: { 
        color: theme.palette.getContrastText(colorHex || "#f0f0f0"),
        fontSize: '20px' 
      }
    };
    if (noInvert) {
      iconProps.style.color = colorHex || "#f0f0f0"; // Use the provided color directly
    }

    return React.createElement(IconComponent, iconProps);
  };

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (data && data.categories) {
          setCategories(data.categories);
          
          // Build dynamic categoryIcons and categoryColors objects
          const icons = {};
          const colors = {};
          
          data.categories.forEach(category => {
            const categoryKey = category.category.toLowerCase();
            icons[categoryKey] = getCategoryIcon(category.icon, category.colorHex);
            colors[categoryKey] = category.colorHex;
          });
          
          // Add uncategorized as fallback
          icons.uncategorized = <UncategorizedIcon />;
          colors.uncategorized = "#f0f0f0";
          
          setCategoryIcons(icons);
          setCategoryColors(colors);
        } else {
          console.error("Failed to fetch categories or no categories found");
          // Set fallback categories
          setCategoryIcons({ uncategorized: <UncategorizedIcon /> });
          setCategoryColors({ uncategorized: "#f0f0f0" });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Set fallback categories
        setCategoryIcons({ uncategorized: <UncategorizedIcon /> });
        setCategoryColors({ uncategorized: "#f0f0f0" });
      }
    };
    
    loadCategories();
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchAndSetTransactions = async () => {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      const data = await fetchTransactions(startDate.getTime(), endDate.getTime());
      setTransactions(data.transactions || []);
    };
    fetchAndSetTransactions();
  }, [fromDate, toDate]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleIgnoreFilterChange = (event) => {
    setIgnoreFilter(event.target.value);
  };

  const handleRefreshTransactions = async () => {
    processMessages();
    setIsRefreshing(true);
    try {
      const data = await fetchTransactions(fromDate.getTime(), toDate.getTime());
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleIgnore = async (transaction) => {
    let transactionsToDelete = selectedTransactions;
    if (transactionsToDelete.length === 0) {
      transactionsToDelete = [transaction];
    }
    // Optimistically update the ignore status locally
    const updatedTransactions = transactions.map(transaction => {
      if (transactionsToDelete.includes(transaction)) {
        return { ...transaction, ignore: !transaction.ignore };
      }
      return transaction;
    });
    setTransactions(updatedTransactions);

    // Attempt to ignore/unignore transactions via API
    transactionsToDelete.forEach(async (transaction) => {
      try {
        if (transaction.ignore) {
          await unignoreTransaction(transaction.id);
        } else {
          await ignoreTransaction(transaction.id);
        }
      } catch (error) {
        console.error("Error updating transaction ignore status:", error);
        alert(`Failed to update ignore status for transaction ${transaction.id}`);
      }
    });

    setSelectedTransactions([]);
  };

  const handleCategorize = (transaction) => {
    if (selectedTransactions.length === 0) {
      setSelectedTransactions([transaction]);
    }
    setCategoryDialogOpen(true);
  };

  const handleReason = (transaction) => {
    setSelectedTransaction(transaction);
    setReason(transaction.reason || "");
    setReasonDialogOpen(true);
  };

  const categoryTotals = transactions.reduce((acc, transaction) => {
    if (
      transaction.category &&
      !transaction.ignore &&
      transaction.transactiontype === "debit"
    ) {
      acc[transaction.category] =
        (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals)
    .map((category) => ({
      name: category,
      value: Math.floor(categoryTotals[category]),
      color: categoryColors[category.toLowerCase()] || "#000",
    }))
    .sort((a, b) => b.value - a.value);

  const handlePieClick = (category) => {
    setFilterCategory(filterCategory === category ? "all" : category);
  };

  const handleCategorySelect = (category) => {
    if (selectedTransactions.length === 0) {
      console.log("No transactions selected for categorization");
      return;
    }
    
    // Optimistically update the category locally
    const updatedTransactions = transactions.map(transaction => {
      if (selectedTransactions.includes(transaction)) {
        return { ...transaction, category };
      }
      return transaction;
    });
    setTransactions(updatedTransactions);

    // Attempt to categorize transactions via API
    selectedTransactions.forEach(async (transaction) => {
      try {
        await categorizeTransaction(transaction.id, category);
      } catch (error) {
        console.error("Error categorizing transaction:", error);
        alert(`Failed to categorize transaction ${transaction.id}`);
      }
    });

    setCategoryDialogOpen(false);
    setSelectedTransactions([]);
  };

  const handleReasonSubmit = async () => {
    // Optimistically update the reason locally
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.id === selectedTransaction.id) {
        return { ...transaction, reason };
      }
      return transaction;
    });
    setTransactions(updatedTransactions);
    setReasonDialogOpen(false);

    try {
      await addTransactionReason(selectedTransaction.id, reason);
      console.log(
        `Transaction ${selectedTransaction.id} reason updated to: ${reason}`
      );
      await handleRefreshTransactions();
    } catch (error) {
      console.error("Error updating transaction reason:", error);
      alert(`Failed to update reason for transaction ${selectedTransaction.id}`);
    } finally {
      setSelectedTransaction(null);
      setReason("");
    }
  };

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const queryMatch =
        transaction.merchant.toLowerCase().includes(searchQuery) ||
        transaction.account.toLowerCase().includes(searchQuery);
      const categoryMatch =
        filterCategory === "all" || transaction.category === filterCategory;
      const typeMatch =
        filterType === "all" || transaction.transactiontype === filterType;
      let ignoreMatch = true;
      if (ignoreFilter === "active") {
        ignoreMatch = !transaction.ignore;
      } else if (ignoreFilter === "ignored") {
        ignoreMatch = transaction.ignore;
      }
      return queryMatch && categoryMatch && typeMatch && ignoreMatch;
    });
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterCategory, filterType, ignoreFilter]);

  useEffect(() => {
    const totalAmount = filteredTransactions.reduce((sum, transaction) => {
      return !transaction.ignore && transaction.transactiontype === "debit"
        ? sum + transaction.amount
        : sum;
    }, 0);
    setTotal(totalAmount);
  }, [filteredTransactions]);

  const capitalizeFirst = (str) => {
    if (str) return str.charAt(0).toUpperCase() + str.slice(1);
    return str;
  };

  const handleAddTransaction = async () => {
    try {
      await addTransaction({
        ...newTransaction,
        timestamp: moment().unix()
      });
      console.log("Transaction added successfully");
      await handleRefreshTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setAddDialogOpen(false);
      setNewTransaction({
        amount: '',
        merchant: ''
      });
    }
  }

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: "calc(100vh - 120px)",
      }}
    >
      <Typography variant="h5"
        sx={{ flex: '0 0 auto' }}
      >
        {filterCategory === "all"
          ? "Transactions"
          : capitalizeFirst(filterCategory)}{" "}
        - ₹{total.toLocaleString("en-IN")}
      </Typography>
      <Grid container spacing={1}
        sx={{ flex: '0 0 auto' }}
      >
        <Grid item xs={6}>
          <Box sx={{ width: "100%", height: { xs: 200, sm: 180 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  onClick={({ name }) => handlePieClick(name)}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              height: "100%",
              p: 1,
            }}
          >
            {pieData.map((item, index) => (
              <Box
                key={index}
                onClick={() => handlePieClick(item.name)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  mb: 0.3,
                  p: 0,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">{item.name} - ₹{item.value.toLocaleString("en-IN")}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
        }}
      >
        {/* Search and Filter Section */}
        <Stack direction="column" spacing={2}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ flex: 1, minWidth: 220 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by merchant or account"
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{ endAdornment: <SearchIcon /> }}
                fullWidth
              />
            </FormControl>
            <FormControl size="small">
              <IconButton
                onClick={() => setShowCheckboxes(!showCheckboxes)}
                title="Toggle Checkboxes"
              >
                <ChecklistIcon />
              </IconButton>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleTypeChange}
                label="Type"
              >
                <MenuItem value="all">All</MenuItem>
                {filterTypes.map((filter) => (
                  <MenuItem key={filter} value={filter}>
                    {capitalizeFirst(filter)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <InputLabel>Transaction Status</InputLabel>
              <Select
                value={ignoreFilter}
                onChange={handleIgnoreFilterChange}
                label="Transaction Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="ignored">Ignored</MenuItem>
              </Select>
            </FormControl> 
            <FormControl size="small" sx={{ minWidth: 0 }}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateRangePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  setFromDate={setFromDate}
                  setToDate={setToDate}
                />
              </LocalizationProvider>
            </FormControl>
          </Box>
        </Stack>

        {/* Transaction List */}
        <List>
          {filteredTransactions.map((transaction) => {
            const categoryKey = transaction.category?.toLowerCase() || "uncategorized";
            const IconElement = React.cloneElement(
              categoryIcons[categoryKey] || <UncategorizedIcon />,
              {
                style: {
                  color: theme.palette.getContrastText(categoryColors[categoryKey.toLowerCase()] || "#f0f0f0"),
                },
              }
            );
            return (
              <ListItem key={transaction.id} divider>
                {showCheckboxes && (
                  <Checkbox
                    checked={selectedTransactions.includes(transaction)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions([...selectedTransactions, transaction]);
                      } else {
                        setSelectedTransactions(selectedTransactions.filter(t => t.id !== transaction.id));
                      }
                    }}
                  />
                )}
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: categoryColors[categoryKey.toLowerCase()] || "#f0f0f0" }}>
                    {IconElement}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        textDecoration: transaction.ignore ? "line-through" : "none",
                      }}
                    >
                      {transaction.reason || transaction.merchant}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        <span style={{ fontWeight: "bold" }}>
                          ₹{transaction.amount.toLocaleString("en-IN")}
                        </span>{" "}
                        • {transaction.account}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {(() => {
                          const date = new Date(transaction.timestamp * 1000);
                          const day = date.getDate();
                          const month = date
                            .toLocaleString("en-IN", { month: "short" })
                            .toLowerCase();
                          const year = date.getFullYear();
                          const time = date.toLocaleTimeString("en-IN", {
                            hour12: true,
                            hour: "numeric",
                            minute: "numeric",
                          });
                          return `${capitalizeFirst(month)} ${day} ${year}, ${time}`;
                        })()}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    handleIgnore(transaction);
                  }}
                  title={transaction.ignore ? "Unignore" : "Ignore"}
                >
                  {transaction.ignore ? (
                    <RestoreIcon color="action" />
                  ) : (
                    <DeleteOutlineIcon color="action" />
                  )}
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleCategorize(transaction)}
                  title="Categorize"
                >
                    <BookmarkBorderIcon color="action" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleReason(transaction)}
                    title="Add Reason"
                  >
                    <NotesIcon color="action" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onClose={() => {
          setCategoryDialogOpen(false);
          setSelectedTransactions([]);
        }}>
          <DialogTitle>Select a Category</DialogTitle>
          <DialogContent sx={{ display: "flex", flexWrap: "wrap" }}>
            {categories.map((category) => (
              <Button
                key={category.category}
                onClick={() => handleCategorySelect(category.category)}
                startIcon={getCategoryIcon(category.icon, category.colorHex, true)}
                sx={{ m: 1 }}
              >
                {capitalizeFirst(category.category)}
              </Button>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Reason Dialog */}
        <Dialog open={isReasonDialogOpen} onClose={() => setReasonDialogOpen(false)}>
          <DialogTitle>Add Reason</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter reason here"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReasonDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReasonSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>

        {/* Add Transaction Button */}
        <Fab
          color="secondary"
          onClick={() => setAddDialogOpen(true)}
          sx={{ position: "fixed", bottom: 80, right: 16 }}
          aria-label="add"
        >
          <AddIcon />
        </Fab>

        {/* Add Transaction Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => setAddDialogOpen(false)}>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              variant="outlined"
              label="Amount"
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Reason"
              value={newTransaction.merchant}
              onChange={(e) => setNewTransaction({ ...newTransaction, merchant: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Refresh Button */}
        <Fab
          color="primary"
          onClick={handleRefreshTransactions}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          disabled={isRefreshing}
          aria-label="refresh"
        >
          <SyncIcon />
        </Fab>
      </Box>
    </Container>
  );
}

export default Transactions;

