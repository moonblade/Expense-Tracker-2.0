import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const ColorPalette = ({ selectedColor, onColorSelect }) => {
  // Improved color palette with vibrant, muted, neutral, and pastel colors
  const colorCategories = {
    'Vibrant Colors': [
      '#FF6F61', '#DD4124', '#FF7B25', '#EFC050', '#88B04B',
      '#009B77', '#45B8AC', '#008ECC', '#6B5B95', '#B565A7',
      '#C74375', '#9B2335', '#92140C', '#5B5EA6'
    ],
    'Soft & Pastels': [
      '#F7CAC9', '#92A8D1', '#B6D7EA', '#CAE0DC', '#DFCFBE',
      '#FFB347', '#C89FA3', '#FFE4E1', '#E6E6FA', '#F0F8FF',
      '#FFFACD', '#98FB98', '#87CEEB', '#DDA0DD', '#F5DEB3'
    ],
    'Muted & Earth Tones': [
      '#955251', '#55B4B0', '#5D576B', '#9A6E61', '#9C6644',
      '#A2A2A1', '#776868', '#4A4E4D', '#8B7D6B', '#A0522D',
      '#CD853F', '#BC8F8F', '#708090', '#778899', '#2F4F4F'
    ],
    'Modern & Tech': [
      '#31393C', '#2C3E50', '#34495E', '#16A085', '#27AE60',
      '#2980B9', '#8E44AD', '#E74C3C', '#F39C12', '#D35400',
      '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#3498DB'
    ],
    'Warm Colors': [
      '#FF8A80', '#FF5722', '#FF9800', '#FFC107', '#CDDC39',
      '#8BC34A', '#4CAF50', '#009688', '#00BCD4', '#03A9F4',
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
    ],
    'Cool Colors': [
      '#74B9FF', '#0984E3', '#6C5CE7', '#A29BFE', '#FD79A8',
      '#E84393', '#00B894', '#00CEC9', '#55EFC4', '#81ECEC',
      '#2ECC71', '#1ABC9C', '#3498DB', '#9B59B6', '#E67E22'
    ]
  };

  // Flatten all colors for easy access
  const renderColorSection = (categoryName, colors) => (
    <Box key={categoryName} sx={{ mb: 2 }}>
      <Chip 
        label={categoryName} 
        size="small" 
        sx={{ 
          mb: 1, 
          fontSize: '0.75rem'
        }} 
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(35px, 1fr))',
          gap: 0.8,
          mb: 1
        }}
      >
        {colors.map((color, index) => (
          <IconButton
            key={`${color}-${index}`}
            onClick={() => onColorSelect(color)}
            sx={{
              width: 35,
              height: 35,
              backgroundColor: color,
              border: selectedColor === color ? '3px solid #1976d2' : '1px solid rgba(0,0,0,0.12)',
              borderRadius: '8px',
              position: 'relative',
              boxShadow: selectedColor === color 
                ? '0 4px 12px rgba(25, 118, 210, 0.4)' 
                : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: 0,
              minWidth: 'auto',
              cursor: 'pointer'
            }}
          >
            {selectedColor === color && (
              <CheckIcon 
                sx={{ 
                  fontSize: 18, 
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: '50%',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }} 
              />
            )}
          </IconButton>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Choose Color
      </Typography>
      
      <Box
        sx={{
          maxHeight: 350,
          overflowY: 'auto',
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '3px',
          },
        }}
      >
        {Object.entries(colorCategories).map(([categoryName, colors]) =>
          renderColorSection(categoryName, colors)
        )}
      </Box>
      
      {/* Enhanced selected color info */}
      {false && selectedColor && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            Selected:
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: selectedColor,
              border: '2px solid #fff',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {selectedColor}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {Object.entries(colorCategories).find(([, colors]) => 
                colors.includes(selectedColor)
              )?.[0] || 'Custom Color'}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ColorPalette;

