import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync"; // Use this as a "Refresh Transactions" icon.
import { fetchTransactions } from "./query.svc";
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
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchAndSetTransactions = async () => {
      const data = await fetchTransactions();
      setTransactions(data.transactions || []);
      filterTransactions(searchQuery, filterCategory, data.transactions || []);
    };

    fetchAndSetTransactions();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterTransactions(query, filterCategory);
  };

  const handleFilterChange = (event) => {
    const category = event.target.value;
    setFilterCategory(category);
    filterTransactions(searchQuery, category);
  };

  const filterTransactions = (query, category, transactionsList = transactions) => {
    let updatedTransactions = transactionsList;

    if (category !== "all") {
      updatedTransactions = updatedTransactions.filter(
        (tx) => tx.category.toLowerCase() === category
      );
    }

    if (query) {
      updatedTransactions = updatedTransactions.filter(
        (tx) =>
          tx.merchant.toLowerCase().includes(query) ||
          tx.account.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(updatedTransactions);
  };

  const handleRefreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data.transactions || []);
      filterTransactions(searchQuery, filterCategory, data.transactions || []);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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

      {/* Transactions List */}
      <Grid container spacing={2}>
        {filteredTransactions.map((tx) => (
          <Grid item xs={12} sm={6} md={4} key={tx.id}>
            <Card
              sx={{
                marginBottom: 2,
                borderLeft: `4px solid ${
                  tx.transactiontype === "debit" ? "red" : "green"
                }`,
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {categoryIcons[tx.category.toLowerCase()] || <UncategorizedIcon />}
                  <Typography variant="body1">{tx.merchant}</Typography>
                </Stack>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  {new Date(tx.timestamp * 1000).toLocaleString("en-IN", {
                    hour12: true,
                    hour: "numeric",
                    minute: "numeric",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Typography>
                <Typography variant="body2">Account: {tx.account}</Typography>
                <Typography variant="body2">Amount: ₹{tx.amount.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Transactions;

