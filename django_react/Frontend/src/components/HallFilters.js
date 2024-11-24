import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const HallFilters = ({ filters, onFilterChange }) => {
  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск зала"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
        />
      </Grid>
      <Grid item xs={6} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Локация</InputLabel>
          <Select
            value={filters.location}
            label="Локация"
            onChange={(e) => handleChange('location', e.target.value)}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="gorny">Горный</MenuItem>
            <MenuItem value="belyaevo">Беляево</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Заполненность</InputLabel>
          <Select
            value={filters.capacity}
            label="Заполненность"
            onChange={(e) => handleChange('capacity', e.target.value)}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="green">Свободно</MenuItem>
            <MenuItem value="yellow">Заполняется</MenuItem>
            <MenuItem value="red">Заполнено</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default HallFilters;
