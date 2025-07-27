import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box,
  Chip,
  Avatar,
  Fab
} from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import React from 'react';
import { ChromePicker } from 'react-color';
import { fetchCategories } from './query.svc';

function Categories() {
  const [categories, setCategories] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [currentCategory, setCurrentCategory] = React.useState(null);
  const [formData, setFormData] = React.useState({
    category: '',
    icon: '',
    colorHex: '#000000'
  });

  React.useEffect(() => {
    fetchCategories().then(data => {
      if (data && data.categories) {
        setCategories(data.categories);
        console.log("Fetched categories:", data.categories);
      } else {
        console.error("Failed to fetch categories or no categories found");
      }
    }).catch(error => {
      console.error("Error fetching categories:", error);
    });
  }, []);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({
        category: category.category,
        icon: category.icon,
        colorHex: category.colorHex
      });
    } else {
      setEditMode(false);
      setCurrentCategory(null);
      setFormData({
        category: '',
        icon: '',
        colorHex: '#000000'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({
      category: '',
      icon: '',
      colorHex: '#000000'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      colorHex: color.hex
    }));
  };

  const handleSave = () => {
    console.log('Saving category:', formData);
    
    if (editMode) {
      setCategories(prev => prev.map(cat => 
        cat.category === currentCategory.category 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      const newCategory = {
        ...formData,
        default: false
      };
      setCategories(prev => [...prev, newCategory]);
    }
    
    handleCloseDialog();
  };

  const getCategoryIcon = (iconName, colorHex) => {
    // Get the MUI icon component name
    const muiIconName = iconName;
    
    // Dynamically get the icon component from MuiIcons
    let IconComponent = MuiIcons[muiIconName];
    if (!IconComponent) {
      // If the icon doesn't exist, fallback to Category icon
      IconComponent = MuiIcons.Category;
    }
    
    // If the icon doesn't exist, fallback to Category icon
    const FallbackIcon = MuiIcons.Category;
    
    const iconProps = {
      style: { 
        color: '#000000', // Black icon
        fontSize: '20px' 
      }
    };

    const ActualIcon = IconComponent || FallbackIcon;

    return (
      <Avatar
        sx={{
          backgroundColor: colorHex, // Colored background
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActualIcon {...iconProps} />
      </Avatar>
    );
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: "calc(100vh - 120px)",
      }}
    >
      {/* Header with Add button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flex: '0 0 auto'
        }}
      >
        <Fab
          color="secondary"
          onClick={() => handleOpenDialog()}
          sx={{ position: "fixed", bottom: 80, right: 16 }}
          aria-label="add"
        >
          <MuiIcons.Add />
        </Fab>
        
      </Box>

      {/* Categories List */}
      <Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
        <List>
          {categories.map((category) => (
            <ListItem
              key={category.category}
              sx={{
                mb: 1,
              }}
              secondaryAction={
                (
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(category)}
                    sx={{ color: '#666' }}
                  >
                    <MuiIcons.Edit />
                  </IconButton>
                )
              }
            >
              <ListItemIcon sx={{ }}>
                {getCategoryIcon(category.icon, category.colorHex)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {category.category}
                    </Typography>
                    {category.default && (
                      <Chip
                        size="small"
                        label="Default"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              fullWidth
              variant="outlined"
            />
            
            <TextField
              label="Icon Name"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              fullWidth
              variant="outlined"
              helperText="Enter the icon name for this category"
            />
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Choose Color
              </Typography>
              <ChromePicker
                color={formData.colorHex}
                onChange={handleColorChange}
                disableAlpha
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!formData.category.trim() || !formData.icon.trim()}
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Categories;

