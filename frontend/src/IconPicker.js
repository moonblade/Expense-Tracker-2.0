import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Box,
  Typography,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import * as MuiIcons from '@mui/icons-material';

const IconPicker = ({ open, onClose, onSelect, selectedIcon = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Get all MUI icon names
  const allIconNames = useMemo(() => {
    return Object.keys(MuiIcons);
  }, []);

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    if (!searchTerm) return allIconNames.slice(0, 100); // Show first 100 icons by default
    
    return allIconNames.filter(iconName =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 100); // Limit to 100 results for performance
  }, [searchTerm, allIconNames]);

  const handleIconSelect = (iconName) => {
    onSelect(iconName);
    onClose();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const renderIcon = (iconName) => {
    const IconComponent = MuiIcons[iconName];
    if (!IconComponent) return null;

    return (
      <IconButton
        key={iconName}
        onClick={() => handleIconSelect(iconName)}
        sx={{
          flexDirection: 'column',
          p: 1,
          m: 0.5,
          border: selectedIcon === iconName ? '2px solid #1976d2' : '1px solid #e0e0e0',
          borderRadius: 1,
          backgroundColor: selectedIcon === iconName ? '#e3f2fd' : 'transparent',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <IconComponent sx={{ fontSize: 24, mb: 0.5 }} />
        <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center' }}>
          {iconName}
        </Typography>
      </IconButton>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        Select an Icon
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search icons..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {filteredIcons.length} icons found {searchTerm && `for "${searchTerm}"`}
        </Typography>

        <Box
          sx={{
            height: 400,
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 1
          }}
        >
          <Grid container spacing={0}>
            {filteredIcons.map((iconName) => (
              <Grid item key={iconName}>
                {renderIcon(iconName)}
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {selectedIcon && (
          <Button 
            onClick={() => handleIconSelect(selectedIcon)}
            variant="contained"
          >
            Select "{selectedIcon}"
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default IconPicker;
