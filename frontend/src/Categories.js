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
  Avatar,
  Fab
} from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import React from 'react';
import { ChromePicker } from 'react-color';
import { fetchCategories, upsertCategory, deleteCategory } from './query.svc';

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
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(null); // Track which category is being deleted

  const refreshCategories = () => {
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
  };


  React.useEffect(() => {
    refreshCategories();
  }, []);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({
        id: category.id,
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

  const handleSave = async () => {
    console.log('Saving category:', formData);
    setIsLoading(true);
    
    try {
      const result = await upsertCategory(formData);
      
      if (result && result.status === 'success') {
        if (editMode) {
          setCategories(prev => prev.map(cat => 
            cat.category === currentCategory.category 
              ? { ...cat, ...formData }
              : cat
          ));
        } else {
          setCategories(prev => [...prev, formData]);
        }
        
        console.log(`Category ${editMode ? 'updated' : 'added'} successfully`);
        handleCloseDialog();
      } else {
        console.error('Failed to save category:', result?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsLoading(false);
      refreshCategories(); // Refresh categories after save
    }
  };

  const handleDelete = async (categoryId) => {
    setIsDeleting(categoryId);
    
    try {
      const result = await deleteCategory(categoryId);
      
      if (result && result.status === 'success') {
        // Remove the category from local state
        setCategories(prev => prev.filter(cat => cat.category !== categoryId));
        console.log('Category deleted successfully');
      } else {
        console.error('Failed to delete category:', result?.message || 'Unknown error');
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(null);
      refreshCategories(); // Refresh categories after delete
    }
  };

  const getCategoryIcon = (iconName, colorHex) => {
    const muiIconName = iconName;
    let IconComponent = MuiIcons[muiIconName];
    if (!IconComponent) {
      IconComponent = MuiIcons.Category;
    }
    
    const FallbackIcon = MuiIcons.Category;
    const iconProps = {
      style: { 
        color: '#000000',
        fontSize: '20px' 
      }
    };

    const ActualIcon = IconComponent || FallbackIcon;

    return (
      <Avatar
        sx={{
          backgroundColor: colorHex,
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

      <Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
        <List>
          {categories.map((category) => (
            <ListItem
              key={category.category}
              sx={{ mb: 1 }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(category)}
                    sx={{ color: '#666' }}
                    disabled={isDeleting === category.category}
                  >
                    <MuiIcons.Edit />
                  </IconButton>
                  {category.id && (
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(category.id)}
                      sx={{ color: '#d32f2f' }}
                      disabled={isDeleting === category.id}
                    >
                      <MuiIcons.Delete />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <ListItemIcon>
                {getCategoryIcon(category.icon, category.colorHex)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {category.category}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

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
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!formData.category.trim() || !formData.icon.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : (editMode ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Categories;

