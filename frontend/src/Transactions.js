import React, { useState, useEffect } from "react";
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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import BlockIcon from "@mui/icons-material/Block";
import CategoryIcon from "@mui/icons-material/Category";
import EditNoteIcon from "@mui/icons-material/EditNote";
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
import {
  categorizeTransaction,
  fetchTransactions,
  ignoreTransaction,
  processMessages,
  unignoreTransaction,
} from "./query.svc";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("debit");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [showIgnored, setShowIgnored] = useState(false);

  useEffect(() => {
    const fetchAndSetTransactions = async () => {
      const data = await fetchTransactions();
      setTransactions(data.transactions || []);
    };
    fetchAndSetTransactions();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
  };

  const handleTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleRefreshTransactions = async () => {
    processMessages();
    setIsRefreshing(true);
    try {
      const data = await fetchTransactions();
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

  const handleCategorize = (transaction) => {
    setSelectedTransaction(transaction);
    setCategoryDialogOpen(true);
  };

  const handleReason = (transaction) => {
    setSelectedTransaction(transaction);
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
    if (!selectedTransaction) {
      console.log("No transaction selected for categorization");
      return;
    }
    try {
      await categorizeTransaction(selectedTransaction.id, category);
      await handleRefreshTransactions();
      console.log(
        `Transaction ${selectedTransaction.id} categorized as ${category}`
      );
    } catch (error) {
      console.error("Error categorizing transaction:", error);
    } finally {
      setCategoryDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleReasonSubmit = () => {
    console.log("Reason updated to:", reason);
    setReasonDialogOpen(false);
    setSelectedTransaction(null);
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
      const ignoreMatch = showIgnored || !transaction.ignore;
      return queryMatch && categoryMatch && typeMatch && ignoreMatch;
    });
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterCategory, filterType, showIgnored]);

  useEffect(() => {
    const totalAmount = filteredTransactions.reduce((sum, transaction) => {
      return !transaction.ignore && transaction.transactiontype === "debit"
        ? sum + transaction.amount
        : sum;
    }, 0);
    setTotal(totalAmount);
  }, [filteredTransactions]);

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5">Transactions</Typography>
      <Typography variant="h6" color="textSecondary">
        Total Spent: ₹{total.toLocaleString("en-IN")}
      </Typography>

      {/* Dashboard-like Pie Chart */}
      <Box sx={{ width: "100%", height: 250 }}>
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

      {/* Search and Filters */}
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by merchant or account"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filterCategory}
            onChange={handleFilterChange}
            label="Category"
          >
            <MenuItem value="all">All</MenuItem>
            {Object.keys(categoryIcons)
              .sort(
                (a, b) =>
                  (categoryTotals[b] || 0) - (categoryTotals[a] || 0)
              )
              .map((key) => (
                <MenuItem key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={handleTypeChange}
            label="Type"
          >
            <MenuItem value="all">All</MenuItem>
            {filterTypes.map((filter) => (
              <MenuItem key={filter} value={filter}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={showIgnored}
              onChange={(e) => setShowIgnored(e.target.checked)}
              color="primary"
            />
          }
          label="Show Ignored"
        />
        <IconButton
          onClick={handleRefreshTransactions}
          color="primary"
          disabled={isRefreshing}
          title="Refresh Transactions"
        >
          <SyncIcon />
        </IconButton>
      </Stack>

      {/* Mobile-Friendly Transaction List */}
      <List>
        {filteredTransactions.map((transaction) => (
          <ListItem key={transaction.id} divider>
            <ListItemAvatar>
              <Avatar>
                {categoryIcons[
                  transaction.category?.toLowerCase() || "uncategorized"
                ] || <UncategorizedIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    textDecoration: transaction.ignore ? "line-through" : "none",
                  }}
                >
                  {transaction.merchant}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary">
                    {transaction.account} • ₹
                    {transaction.amount.toLocaleString("en-IN")}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(transaction.timestamp * 1000).toLocaleString("en-IN", {
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
                <BlockIcon color={transaction.ignore ? "secondary" : "error"} />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleCategorize(transaction)}
                title="Categorize"
              >
                <CategoryIcon color="primary" />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleReason(transaction)}
                title="Add Reason"
              >
                <EditNoteIcon color="action" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
      >
        <DialogTitle>Select a Category</DialogTitle>
        <DialogContent sx={{ display: "flex", flexWrap: "wrap" }}>
          {Object.keys(categoryIcons).map((key) => (
            <Button
              key={key}
              onClick={() => handleCategorySelect(key)}
              startIcon={categoryIcons[key]}
              sx={{ m: 1 }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Reason Dialog */}
      <Dialog
        open={isReasonDialogOpen}
        onClose={() => setReasonDialogOpen(false)}
      >
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
    </Box>
  );
}

export default Transactions;

