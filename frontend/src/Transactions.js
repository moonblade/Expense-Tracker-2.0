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
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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

const filterTypes = ["credit", "debit"];

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [total, setTotal] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("debit");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [showIgnored, setShowIgnored] = useState(false);

  const handleShowIgnoredChange = (event) => {
    setShowIgnored(event.target.checked);
  };

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

  const handleMenuOpen = (event, transaction) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = (removeSelectedTransaction = true) => {
    setMenuAnchorEl(null);
    if (removeSelectedTransaction)
      setSelectedTransaction(null);
  };

  const handleIgnore = async () => {
    if (!selectedTransaction) return;
    try {
      if (selectedTransaction.ignore) {
        await unignoreTransaction(selectedTransaction.id);
      } else {
        await ignoreTransaction(selectedTransaction.id);
      }
      handleRefreshTransactions();
    } catch (error) {
      console.error("Error updating transaction ignore status:", error);
    } finally {
      handleMenuClose();
    }
  };


  const handleCategorize = () => {
    setCategoryDialogOpen(true);
    handleMenuClose(false);
  };

  const handleReason = () => {
    setReasonDialogOpen(true);
    handleMenuClose();
  };

  const handleCategorySelect = async (category) => {
    if (!selectedTransaction) {
      console.log("No transaction selected for categorization")
      return;
    }
    try {
      await categorizeTransaction(selectedTransaction.id, category);
      await handleRefreshTransactions(); // Refresh data
      console.log(`Transaction ${selectedTransaction.id} categorized as ${category}`);
    } catch (error) {
      console.error("Error categorizing transaction:", error);
      // Show error feedback to the user
    } finally {
      setCategoryDialogOpen(false); // Close dialog
    }
  };

  const handleReasonSubmit = () => {
    console.log("Reason updated to:", reason);
    setReasonDialogOpen(false);
  };

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const queryMatch =
        transaction.merchant.toLowerCase().includes(searchQuery) ||
        transaction.account.toLowerCase().includes(searchQuery);
      const categoryMatch = filterCategory === "all" || transaction.category === filterCategory;
      const typeMatch = filterType === "all" || transaction.transactiontype === filterType;
      const ignoreMatch = showIgnored || !transaction.ignore;
      return queryMatch && categoryMatch && typeMatch && ignoreMatch;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterCategory, filterType, showIgnored]);

  useEffect(() => {
    const total = filteredTransactions.reduce((sum, transaction) => {
      return !transaction.ignore && transaction.transactiontype === "debit"
        ? sum + transaction.amount
        : sum;
    }, 0);
    setTotal(total);
  }, [filteredTransactions]);

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "ignore", headerName: "Ignore", flex: 1 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => categoryIcons[params.value.toLowerCase()] || <UncategorizedIcon />,
    },
    {
    field: "merchant",
    headerName: "Merchant",
    flex: 1,
    renderCell: (params) => (
        <Typography
          sx={{
            textDecoration: params.row.ignore ? "line-through" : "none",
            color: params.row.ignore ? "text.secondary" : "inherit",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "account",
      headerName: "Account",
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{
            textDecoration: params.row.ignore ? "line-through" : "none",
            color: params.row.ignore ? "text.secondary" : "inherit",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{
            textDecoration: params.row.ignore ? "line-through" : "none",
            color: params.row.ignore ? "text.secondary" : "inherit",
          }}
        >
          ₹{params.value.toLocaleString("en-IN")}
        </Typography>
      ),
    },
    {
      field: "timestamp",
      headerName: "Date",
      flex: 1,
      valueFormatter: (value) =>
        new Date(value * 1000).toLocaleString("en-IN", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      field: "transactiontype",
      headerName: "Type",
      flex: 1,
      renderCell: (params) =>
        params.value === "credit" ? (
          <ArrowUpwardIcon style={{ color: "green" }} />
        ) : (
          <ArrowDownwardIcon style={{ color: "red" }} />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(event) => handleMenuOpen(event, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100vh", p: 3, display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>

      <Typography variant="h6" color="textSecondary" mb={2}>
        Total Spent: ₹{total.toLocaleString("en-IN")}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
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

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Category</InputLabel>
          <Select
            value={filterCategory}
            onChange={handleFilterChange}
            label="Filter Category"
          >
            <MenuItem value="all">All</MenuItem>
            {Object.keys(categoryIcons).map((key) => (
              <MenuItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Transaction</InputLabel>
          <Select
            value={filterType}
            onChange={handleTypeChange}
            label="Transaction"
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
              onChange={handleShowIgnoredChange}
              color="primary"
            />
          }
          label="Ignore"
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

      <Box sx={{ flex: 1 }}>
        <DataGrid
          columnVisibilityModel={{id: false, ignore: false, transactiontype: filterType == "all"}}
          rows={filteredTransactions}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row.id}
          disableSelectionOnClick
        />
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleIgnore}>
          {selectedTransaction?.ignore ? "Unignore" : "Ignore"}
        </MenuItem>
        <MenuItem onClick={handleCategorize}>Categorize</MenuItem>
        <MenuItem onClick={handleReason}>Add Reason</MenuItem>
      </Menu>

      <Dialog open={isCategoryDialogOpen} onClose={() => setCategoryDialogOpen(false)}>
        <DialogTitle>Select a Category</DialogTitle>
        <DialogContent>
          {Object.keys(categoryIcons).map((key) => (
            <Button
              key={key}
              onClick={() => handleCategorySelect(key)}
              startIcon={categoryIcons[key]}
              sx={{ margin: 1 }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}

export default Transactions;

