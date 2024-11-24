import React, { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

// Временные данные для демонстрации
const timeSlots = ['8:30', '10:05', '11:40', '13:15', '14:50', '16:25', '18:00'];
const halls = [
  { id: 1, name: 'Л-101', location: 'Горный', capacity: 30, current: 15, pinned: true },
  { id: 2, name: 'Л-102', location: 'Горный', capacity: 25, current: 23, pinned: true },
  { id: 3, name: 'А-305', location: 'Беляево', capacity: 20, current: 5 },
  { id: 4, name: 'Б-201', location: 'Беляево', capacity: 15, current: 15 },
];

const MainPage = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');

  const getStatusColor = (current, capacity) => {
    const ratio = current / capacity;
    if (ratio >= 1) return '#ef5350'; // red
    if (ratio >= 0.5) return '#ffa726'; // orange
    return '#66bb6a'; // green
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            МИСИС
          </Typography>
          <Typography variant="subtitle1">
            Иванов Иван Иванович
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Поиск зала"
                InputProps={{
                  startAdornment: <SearchIcon color="action" />,
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Локация</InputLabel>
                <Select
                  value={selectedLocation}
                  label="Локация"
                  onChange={(e) => setSelectedLocation(e.target.value)}
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
                  value={selectedCapacity}
                  label="Заполненность"
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  <MenuItem value="green">Свободно</MenuItem>
                  <MenuItem value="yellow">Заполняется</MenuItem>
                  <MenuItem value="red">Заполнено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Time Slots */}
        <Paper sx={{ p: 2, mb: 2, overflowX: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2, minWidth: 'min-content' }}>
            {timeSlots.map((time) => (
              <Box
                key={time}
                sx={{
                  minWidth: 100,
                  p: 1,
                  textAlign: 'center',
                  border: '2px solid',
                  borderColor: time === '10:05' ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  bgcolor: time === '10:05' ? 'primary.light' : 'transparent',
                }}
              >
                <Typography variant="body1">{time}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Halls List */}
        <Paper sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
          {/* Pinned Halls */}
          {halls.filter(h => h.pinned).map((hall) => (
            <Box
              key={hall.id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                bgcolor: 'grey.50',
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <IconButton color="primary">
                    <StarIcon />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{hall.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {hall.location}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {hall.current}/{hall.capacity}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: getStatusColor(hall.current, hall.capacity),
                      '&:hover': {
                        bgcolor: getStatusColor(hall.current, hall.capacity),
                      },
                    }}
                  >
                    Записаться
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}

          <Divider sx={{ my: 2 }}>
            <Chip label="Остальные залы" />
          </Divider>

          {/* Other Halls */}
          {halls.filter(h => !h.pinned).map((hall) => (
            <Box
              key={hall.id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <IconButton color="action">
                    <StarBorderIcon />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{hall.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {hall.location}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {hall.current}/{hall.capacity}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: getStatusColor(hall.current, hall.capacity),
                      '&:hover': {
                        bgcolor: getStatusColor(hall.current, hall.capacity),
                      },
                    }}
                  >
                    Записаться
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
};

export default MainPage;
