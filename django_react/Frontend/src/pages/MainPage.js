import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import TimeSlots from '../components/TimeSlots';
import HallCard from '../components/HallCard';
import HallFilters from '../components/HallFilters';
import { useAuth } from '../context/AuthContext';
import { fetchHalls, pinHall, unpinHall, createBooking } from '../services/api';

const MainPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const [halls, setHalls] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    capacity: 'all',
  });

  useEffect(() => {
    loadHalls();
  }, [selectedTime, filters]);

  const loadHalls = async () => {
    try {
      setLoading(true);
      const response = await fetchHalls({
        time_slot: selectedTime,
        location: filters.location !== 'all' ? filters.location : null,
        capacity_status: filters.capacity !== 'all' ? filters.capacity : null,
        search: filters.search || null,
      });
      setHalls(response.data);
    } catch (error) {
      console.error('Error loading halls:', error);
      // TODO: показать уведомление об ошибке
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (hallId) => {
    const hall = halls.find(h => h.id === hallId);
    try {
      if (hall.isPinned) {
        await unpinHall(hallId);
      } else {
        await pinHall(hallId);
      }
      await loadHalls();
    } catch (error) {
      console.error('Error pinning/unpinning hall:', error);
      // TODO: показать уведомление об ошибке
    }
  };

  const handleBook = async (hallId) => {
    if (!selectedTime) {
      // TODO: показать уведомление о необходимости выбрать время
      return;
    }

    try {
      await createBooking({
        hall: hallId,
        time_slot: selectedTime,
        date: new Date().toISOString().split('T')[0], // TODO: добавить выбор даты
      });
      await loadHalls();
    } catch (error) {
      console.error('Error booking hall:', error);
      // TODO: показать уведомление об ошибке
    }
  };

  const pinnedHalls = halls.filter(h => h.isPinned);
  const unpinnedHalls = halls.filter(h => !h.isPinned);

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            МИСИС
          </Typography>
          <Typography variant="subtitle1">
            {user?.full_name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <HallFilters filters={filters} onFilterChange={setFilters} />
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TimeSlots selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
        </Paper>

        <Paper sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {pinnedHalls.length > 0 && (
                <>
                  {pinnedHalls.map((hall) => (
                    <HallCard
                      key={hall.id}
                      hall={hall}
                      isPinned={true}
                      onPin={handlePin}
                      onBook={handleBook}
                    />
                  ))}
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Остальные залы" />
                  </Divider>
                </>
              )}

              {unpinnedHalls.map((hall) => (
                <HallCard
                  key={hall.id}
                  hall={hall}
                  isPinned={false}
                  onPin={handlePin}
                  onBook={handleBook}
                />
              ))}

              {halls.length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Залы не найдены
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MainPage;
