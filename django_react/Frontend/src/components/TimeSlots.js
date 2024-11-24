import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon
} from '@mui/icons-material';

const TimeSlots = ({ selectedTime, onTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState(0);
  const dates = [
    { date: 'Сегодня', day: 'ПН', full: '15 мая' },
    { date: 'Завтра', day: 'ВТ', full: '16 мая' },
    { date: 'ПН', day: 'ПН', full: '17 мая' },
    { date: 'ВТ', day: 'ВТ', full: '18 мая' },
    { date: 'СР', day: 'СР', full: '19 мая' }
  ];

  const timeSlots = [
    { time: '8:30', name: '1 пара', duration: '95 мин' },
    { time: '10:05', name: '2 пара', duration: '95 мин' },
    { time: '11:40', name: '3 пара', duration: '95 мин' },
    { time: '13:15', name: '4 пара', duration: '95 мин' },
    { time: '14:50', name: '5 пара', duration: '95 мин' },
    { time: '16:25', name: '6 пара', duration: '95 мин' },
    { time: '18:00', name: '7 пара', duration: '95 мин' }
  ];

  const handleDateChange = (event, newValue) => {
    setSelectedDate(newValue);
  };

  return (
    <Paper elevation={0} sx={{ mb: 3, bgcolor: 'background.default' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={selectedDate} 
          onChange={handleDateChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              py: 1
            }
          }}
        >
          {dates.map((date, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.primary">
                    {date.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {date.full}
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 1.5, 
        overflowX: 'auto', 
        py: 2,
        px: 2,
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'grey.100',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'grey.400',
          borderRadius: 4,
          '&:hover': {
            bgcolor: 'grey.500',
          },
        },
      }}>
        {timeSlots.map((slot) => (
          <Paper
            key={slot.time}
            elevation={slot.time === selectedTime ? 2 : 0}
            onClick={() => onTimeSelect(slot.time)}
            sx={{
              minWidth: 140,
              p: 1.5,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: slot.time === selectedTime ? 'primary.main' : 'grey.200',
              bgcolor: slot.time === selectedTime ? 'primary.light' : 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
                borderColor: 'primary.main',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon 
                color={slot.time === selectedTime ? 'primary' : 'action'} 
                fontSize="small"
                sx={{ mr: 1 }}
              />
              <Typography 
                variant="h6" 
                color={slot.time === selectedTime ? 'primary' : 'text.primary'}
              >
                {slot.time}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {slot.name}
            </Typography>
            <Chip
              label={slot.duration}
              size="small"
              variant="outlined"
              sx={{ 
                height: 20,
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.75rem'
                }
              }}
            />
          </Paper>
        ))}
      </Box>
    </Paper>
  );
};

export default TimeSlots;
