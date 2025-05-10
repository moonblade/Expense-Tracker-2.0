import React, { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox"; // Import Checkbox component
import AddIcon from "@mui/icons-material/Add"; // Import AddIcon for the button
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
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

// Icons for categories
import {
  Flight as TravelIcon,
  FamilyRestroom as FamilyIcon,
  Restaurant as FoodIcon,
  Group as FriendsIcon,
  LocalHospital as HealthIcon,
  Home as HomeIcon,
  VolunteerActivism as CharityIcon,
  ShoppingCart as ShoppingIcon,
  TrendingUp as InvestmentIcon,
  Theaters as EntertainmentIcon,
  HelpOutline as UncategorizedIcon,
} from "@mui/icons-material";

// Service functions for transactions
import {
    addTransaction,
  addTransactionReason,
  categorizeTransaction,
  fetchTransactions,
  ignoreTransaction,
  processMessages,
  unignoreTransaction,
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
  // Default to "current_month" so that when the dialog is opened,
  // the default selection is current month.
  const [selectedOption, setSelectedOption] = useState("current_month");
  // State for custom selection
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

const categoryIcons = {
  uncategorized: <UncategorizedIcon />,
  travel: <TravelIcon />,
  family: <FamilyIcon />,
  food: <FoodIcon />,
  friends: <FriendsIcon />,
  health: <HealthIcon />,
  home: <HomeIcon />,
  charity: <CharityIcon />,
  shopping: <ShoppingIcon />,
  investment: <InvestmentIcon />,
  entertainment: <EntertainmentIcon />,
};

const categoryColors = {
  uncategorized: "#f0f0f0",
  travel: "#ff6666",
  family: "#66ff66",
  food: "#ffcc00",
  friends: "#66ccff",
  health: "#ff33cc",
  home: "#66ffcc",
  charity: "#ff9933",
  shopping: "#ff6699",
  investment: "#33ccff",
  entertainment: "#cc33ff",
};

const filterTypes = ["credit", "debit"];

function Transactions() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
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
  const [isAddDialogOpen, setAddDialogOpen] = useState(false); // State for Add Transaction dialog
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    merchant: '',
    date: moment().toDate()
  });

  // Default date range: Current Month
  const [fromDate, setFromDate] = useState(moment().startOf("month").toDate());
  const [toDate, setToDate] = useState(moment().endOf("month").toDate());

  // const navigate = useNavigate();
  // const handleTransactionClick = (transaction) => {
  //   navigate(`/messagesui?id=${transaction.id}`);
  // };

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

  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
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
    try {
      if (transaction.ignore) {
        await unignoreTransaction(transaction.id);
      } else {
        await ignoreTransaction(transaction.id);
      }
      handleRefreshTransactions();
    } catch (error) {
      console.error("Error updating transaction ignore status:", error);
    }
  };

  const handleCategorize = () => {
    if (selectedTransactions.length > 0) {
      setCategoryDialogOpen(true);
    } else {
      console.log("No transactions selected for categorization");
    }
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
      color: categoryColors[category] || "#000",
    }))
    .sort((a, b) => b.value - a.value);

  const handlePieClick = (category) => {
    setFilterCategory(filterCategory === category ? "all" : category);
  };

  const handleCategorySelect = async (category) => {
    if (selectedTransactions.length === 0) {
      console.log("No transactions selected for categorization");
      return;
    }
    try {
      for (const transaction of selectedTransactions) {
        await categorizeTransaction(transaction.id, category);
      }
      await handleRefreshTransactions();
      console.log(
        `Transactions categorized as ${category}`
      );
    } catch (error) {
      console.error("Error categorizing transactions:", error);
    } finally {
      setCategoryDialogOpen(false);
      setSelectedTransactions([]);
    }
  };

  const handleReasonSubmit = async () => {
    try {
      await addTransactionReason(selectedTransaction.id, reason);
      console.log(
        `Transaction ${selectedTransaction.id} reason updated to: ${reason}`
      );
      await handleRefreshTransactions();
    } catch (error) {
      console.error("Error updating transaction reason:", error);
    } finally {
      setReasonDialogOpen(false);
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
      // Call the addTransaction function from query.svc.js
      await addTransaction({
        ...newTransaction,
        timestamp: moment().unix()
      });
      console.log("Transaction added successfully");
      await handleRefreshTransactions(); // Refresh transactions after adding
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
    <Container>
      <Typography variant="h5">
        {filterCategory === "all"
          ? "Transactions"
          : capitalizeFirst(filterCategory)}{" "}
        - ₹{total.toLocaleString("en-IN")}
      </Typography>
      <Grid container spacing={1}>
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
                { false && <Typography variant="body2">{item.name}</Typography> }
                { true && <Typography variant="body2">{item.name} - ₹{item.value.toLocaleString("en-IN")}</Typography> }
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          height: "calc(100vh - 150px)",
          overflowY: "auto",
        }}
      >
        {/* Search and Filter Section */}
        <Stack direction="column" spacing={2}>
          {/* Search and Date Range Selector Section */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}> {/* Box for layout */}
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
            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
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
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value="all">All</MenuItem>
                {Object.keys(categoryIcons)
                  .sort((a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0))
                  .map((key) => (
                    <MenuItem key={key} value={key}>
                      {capitalizeFirst(key)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
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
                  color: theme.palette.getContrastText(categoryColors[categoryKey] || "#000"),
                },
              }
            );
            return (
              <ListItem key={transaction.id} divider>
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
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: categoryColors[categoryKey] }}>
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
                    onClick={() => handleIgnore(transaction)}
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
        <Dialog open={isCategoryDialogOpen} onClose={() => setCategoryDialogOpen(false)}>
          <DialogTitle>Select a Category</DialogTitle>
          <DialogContent sx={{ display: "flex", flexWrap: "wrap" }}>
            {Object.keys(categoryIcons).map((key) => (
              <Button
                key={key}
                onClick={() => handleCategorySelect(key)}
                startIcon={categoryIcons[key]}
                sx={{ m: 1 }}
              >
                {capitalizeFirst(key)}
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
            {false && 
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Date"
                value={newTransaction.date}
                onChange={(newValue) => setNewTransaction({ ...newTransaction, date: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            }
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

