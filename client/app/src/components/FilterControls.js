import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, FormControl, Select, MenuItem } from '@mui/material';

const FilterControls = ({ onFilterChange }) => {
  const [viewType, setViewType] = useState('Practice');
  const [location, setLocation] = useState('All');

  const handleViewTypeChange = (event, newViewType) => {
    if (newViewType !== null) {
      setViewType(newViewType);
      onFilterChange({ viewType: newViewType, location });
    }
  };

  const handleLocationChange = (event) => {
    const newLocation = event.target.value;
    setLocation(newLocation);
    onFilterChange({ viewType, location: newLocation });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 3, 
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <ToggleButtonGroup
        value={viewType}
        exclusive
        onChange={handleViewTypeChange}
        aria-label="view type"
        size="small"
      >
        <ToggleButton value="Practice" aria-label="practice view">
          Practice
        </ToggleButton>
        <ToggleButton value="NA View" aria-label="na view">
          NA View
        </ToggleButton>
        <ToggleButton value="GGM View" aria-label="ggm view">
          GGM View
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={location}
          onChange={handleLocationChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Location filter' }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Onsite">Onsite</MenuItem>
          <MenuItem value="Offshore">Offshore</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterControls;