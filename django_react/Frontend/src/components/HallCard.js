import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Computer as ComputerIcon,
  Videocam as VideocamIcon,
  Science as ScienceIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon
} from '@mui/icons-material';

const HallCard = ({ hall, onPin, onBook, selectedTime }) => {
  const getStatusColor = (current, capacity) => {
    const ratio = current / capacity;
    if (ratio >= 1) return '#ef5350'; // red
    if (ratio >= 0.5) return '#ffa726'; // orange
    return '#66bb6a'; // green
  };

  const getStatusText = (current, capacity) => {
    const ratio = current / capacity;
    if (ratio >= 1) return 'Занято';
    if (ratio >= 0.5) return 'Заполняется';
    return 'Свободно';
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'computer':
        return <ComputerIcon />;
      case 'projector':
        return <VideocamIcon />;
      case 'lab':
        return <ScienceIcon />;
      default:
        return null;
    }
  };

  const getOccupancyColor = (ratio) => {
    if (ratio >= 0.8) return 'error';
    if (ratio >= 0.5) return 'warning';
    return 'success';
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="div" gutterBottom>
            {hall.name}
          </Typography>
          <IconButton
            color={hall.isPinned ? 'primary' : 'default'}
            onClick={() => onPin(hall.id)}
            size="small"
          >
            {hall.isPinned ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {hall.location}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <GroupIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Вместимость: {hall.capacity} чел.
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(hall.current / hall.capacity) * 100}
            color={getOccupancyColor(hall.current / hall.capacity)}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Занято {hall.current} из {hall.capacity} мест
          </Typography>
        </Box>

        {selectedTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Выбрано время: {selectedTime}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {hall.equipment && hall.equipment.map((item, index) => (
            <Tooltip key={index} title={item.description || item.type}>
              <Chip
                icon={getEquipmentIcon(item.type)}
                label={item.type}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          ))}
        </Box>

        {hall.nextEvent && (
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
            <EventIcon color="action" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Следующее занятие:
              </Typography>
              <Typography variant="body2">
                {hall.nextEvent.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {hall.nextEvent.time}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onBook(hall.id)}
          disabled={hall.current >= hall.capacity}
          sx={{
            bgcolor: getStatusColor(hall.current, hall.capacity),
            '&:hover': {
              bgcolor: getStatusColor(hall.current, hall.capacity),
              filter: 'brightness(0.9)',
            },
            '&:disabled': {
              bgcolor: 'grey.300',
              color: 'grey.500'
            }
          }}
        >
          {getStatusText(hall.current, hall.capacity)}
        </Button>
      </CardActions>
    </Card>
  );
};

export default HallCard;
