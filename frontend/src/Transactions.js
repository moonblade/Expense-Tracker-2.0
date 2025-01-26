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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Menu icon
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
  HelpOutline as UncategorizedIcon 
} from "@mui/icons-material";
import { fetchTransactions } from "./query.svc";

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

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

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

  const handleRefreshTransactions = async () => {
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

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleIgnore = () => {
    console.log("Ignored transaction:", selectedTransaction);
    handleMenuClose();
  };

  const handleCategorize = () => {
    setCategoryDialogOpen(true);
    handleMenuClose();
  };

  const handleReason = () => {
    setReasonDialogOpen(true);
    handleMenuClose();
  };

  const handleCategorySelect = (category) => {
    console.log("Categorized as:", category);
    setCategoryDialogOpen(false);
  };

  const handleReasonSubmit = () => {
    console.log("Reason updated to:", reason);
    setReasonDialogOpen(false);
  };

  const columns = [
    {
      field: "merchant",
      headerName: "Merchant",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => categoryIcons[params.value.toLowerCase()] || <UncategorizedIcon />,
    },
    {
      field: "account",
      headerName: "Account",
      flex: 1,
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      valueFormatter: (params) => `₹${params.value}`,
    },
    {
      field: "timestamp",
      headerName: "Date",
      flex: 1,
      valueFormatter: (params) =>
        new Date(params.value * 1000).toLocaleString("en-IN", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
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
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>

      {/* Search and Filter */}
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

        {/* Refresh Transactions Button */}
        <IconButton
          onClick={handleRefreshTransactions}
          color="primary"
          disabled={isRefreshing}
          title="Refresh Transactions"
        >
          <SyncIcon />
        </IconButton>
      </Stack>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row.id}
          disableSelectionOnClick
        />
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleIgnore}>Ignore</MenuItem>
        <MenuItem onClick={handleCategorize}>Categorize</MenuItem>
        <MenuItem onClick={handleReason}>Add Reason</MenuItem>
      </Menu>

      {/* Category Dialog */}
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
    </Box>
  );
}

export default Transactions;

