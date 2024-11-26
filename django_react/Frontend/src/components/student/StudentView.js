import React, { useState, useEffect, useRef } from 'react';
import '../styles/base.css';
import '../styles/navigation.css';
import '../styles/hall-card.css';
import '../styles/buttons.css';
import '../styles/header.css';
import '../styles/calendar.css';

// Временные данные о занятости (в будущем будут приходить с сервера)
const timeSlots = ['9:00', '10:50', '12:40', '14:30', '16:30', '18:20'];

const defaultHalls = {
  'Горный': [
    {
      id: 1,
      name: 'Тренажерный зал',
      capacity: 20,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 20 },
        '10:50': { current: 5, max: 20 },
        '12:40': { current: 8, max: 20 },
        '14:30': { current: 15, max: 20 },
        '16:30': { current: 12, max: 20 },
        '18:20': { current: 3, max: 20 },
      }
    },
    {
      id: 2,
      name: 'Игровой зал',
      capacity: 30,
      timeSlotCapacity: {
        '9:00': { current: 10, max: 30 },
        '10:50': { current: 15, max: 30 },
        '12:40': { current: 20, max: 30 },
        '14:30': { current: 25, max: 30 },
        '16:30': { current: 18, max: 30 },
        '18:20': { current: 8, max: 30 },
      }
    },
    {
      id: 3,
      name: 'Зал для фитнеса',
      capacity: 15,
      timeSlotCapacity: {
        '9:00': { current: 5, max: 15 },
        '10:50': { current: 8, max: 15 },
        '12:40': { current: 12, max: 15 },
        '14:30': { current: 15, max: 15 },
        '16:30': { current: 10, max: 15 },
        '18:20': { current: 5, max: 15 },
      }
    },
    {
      id: 4,
      name: 'Зал для бокса',
      capacity: 10,
      timeSlotCapacity: {
        '9:00': { current: 2, max: 10 },
        '10:50': { current: 4, max: 10 },
        '12:40': { current: 6, max: 10 },
        '14:30': { current: 8, max: 10 },
        '16:30': { current: 5, max: 10 },
        '18:20': { current: 3, max: 10 },
      }
    }
  ],
  'Беляево': [
    {
      id: 5,
      name: 'Тренажерный зал',
      capacity: 25,
      timeSlotCapacity: {
        '9:00': { current: 8, max: 25 },
        '10:50': { current: 12, max: 25 },
        '12:40': { current: 18, max: 25 },
        '14:30': { current: 22, max: 25 },
        '16:30': { current: 15, max: 25 },
        '18:20': { current: 10, max: 25 },
      }
    },
    {
      id: 6,
      name: 'Игровой зал',
      capacity: 35,
      timeSlotCapacity: {
        '9:00': { current: 15, max: 35 },
        '10:50': { current: 20, max: 35 },
        '12:40': { current: 25, max: 35 },
        '14:30': { current: 30, max: 35 },
        '16:30': { current: 22, max: 35 },
        '18:20': { current: 12, max: 35 },
      }
    },
    {
      id: 7,
      name: 'Бассейн',
      capacity: 8,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 8 },
        '10:50': { current: 0, max: 8 },
        '12:40': { current: 0, max: 8 },
        '14:30': { current: 0, max: 8 },
        '16:30': { current: 0, max: 8 },
        '18:20': { current: 0, max: 8 },
      }
    }
  ]
};

const HALLS = {
  gorny: defaultHalls['Горный'],
  belyaevo: defaultHalls['Беляево']
};

const StudentView = () => {
  console.log('StudentView rendering');  // Добавьте эту строку в начало компонента

  const [serverTime, setServerTime] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('gorny');
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [selectedTimes, setSelectedTimes] = useState({});
  const [bookings, setBookings] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 - текущая неделя, 1 - следующая
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const fetchServerTime = async () => {
    try {
      console.log('Fetching server time...');
      const response = await fetch('http://127.0.0.1:8000/api/server-time/');  // Изменили URL
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Server response:', data);
      return new Date(data.datetime);
    } catch (error) {
      console.error('Error fetching server time:', error);
      return new Date(); // Fallback to local time if server request fails
    }
  };

  useEffect(() => {
    console.log('Server Time:', serverTime);
  }, [serverTime]);

  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (!savedUserData) {
      window.location.href = '/login';
      return;
    }
    setUserData(JSON.parse(savedUserData));
  }, []);

  useEffect(() => {
    const days = getNextDays();
    if (days.length > 0) {
      setSelectedDate(days[0]); // Выбираем первый день недели
      setSelectedTimes({}); // Сбрасываем выбранное время
    }
  }, [selectedWeek]);

  useEffect(() => {
    const days = getNextDays();
    if (days.length > 0) {
      setSelectedDate(days[0]); // Выбираем первый день недели
      setSelectedTimes({}); // Сбрасываем выбранное время
    }
  }, [selectedWeek]);

  useEffect(() => {
    if (showHistory && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showHistory]);

  useEffect(() => {
    // Функция для обновления текущего дня
    const updateCurrentDay = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Получаем текущий день недели (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
      const currentDay = today.getDay();
      // Преобразуем в индекс (0 - понедельник, ..., 6 - воскресенье)
      const dayIndex = currentDay === 0 ? 6 : currentDay - 1;
      
      if (selectedWeek === 0) {
        setSelectedDay(dayIndex);
        
        // Получаем все дни текущей недели
        const days = getNextDays();
        
        // Находим сегодняшний день среди дней недели
        const todayInWeek = days.find(date => 
          date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
        
        // Если нашли сегодняшний день, устанавливаем его как выбранный
        if (todayInWeek) {
          setSelectedDate(todayInWeek);
          // Сбрасываем выбранное время при смене дня
          setSelectedTimes({});
        }
      }
    };
  
    // Обновляем день при монтировании компонента
    updateCurrentDay();
  
    // Проверяем каждую минуту, не начался ли новый день
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        updateCurrentDay();
      }
    }, 60000);
  
    return () => clearInterval(interval);
  }, [selectedWeek]); // Добавляем selectedWeek в зависимости

  useEffect(() => {
    console.log('Time sync effect running');
    const syncTime = async () => {
      console.log('Syncing time...');
      const time = await fetchServerTime();
      console.log('Got time:', time);
      setServerTime(time);
    };
  
    syncTime();
    const interval = setInterval(syncTime, 60000);
  
    return () => clearInterval(interval);
  }, []);
  
  const getDayName = (date) => {
    if (!(date instanceof Date)) return '';
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  };

  const getDateString = (date) => {
    if (!(date instanceof Date)) return '';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' });
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedTimes({});
  };

  const handleDateSelect = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0); // Сбрасываем время для выбранной даты
    setSelectedDate(newDate);
    setSelectedTimes({});
  };

  const handleTimeSelect = (hallId, time) => {
    setSelectedTimes(prev => ({
      ...prev,
      [hallId]: time
    }));
  };

  const isBookingDisabled = () => {
    return selectedWeek === 1 && !isNextWeekBookingAllowed();
  };

  const handleBooking = (hallId) => {
    const hall = HALLS[selectedLocation].find(h => h.id === hallId);
    const newBooking = {
      id: Date.now(),
      location: selectedLocation === 'gorny' ? 'Горный' : 'Беляево',
      hall: hall.name,
      date: selectedDate,
      time: selectedTimes[hallId]
    };
    setBookings([...bookings, newBooking]);
    setSelectedTimes({ ...selectedTimes, [hallId]: null });
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const getNextDays = () => {
    const days = [];
    const today = serverTime || new Date();
    today.setHours(0, 0, 0, 0);
    
    // Получаем текущий день недели (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
    const currentDay = today.getDay();
    
    // Вычисляем начало текущей недели (понедельник)
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    // Если выбрана следующая неделя, добавляем 7 дней к понедельнику
    if (selectedWeek === 1) {
      monday.setDate(monday.getDate() + 7);
    }
    
    // Добавляем 7 дней, начиная с понедельника
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isNextWeekBookingAllowed = () => {
    const today = new Date();
    return today.getDay() === 6 || today.getDay() === 0; // 6 - суббота, 0 - воскресенье
  };

  const getWeekMonday = (d) => {
    const day = new Date(d);
    const diff = day.getDate() - day.getDay() + (day.getDay() === 0 ? -6 : 1);
    return new Date(day.setDate(diff));
  };

  const isSameWeek = (date1, date2) => {
    const monday1 = getWeekMonday(date1);
    const monday2 = getWeekMonday(date2);
    return monday1.toDateString() === monday2.toDateString();
  };

  const hasTimeConflict = (time, date) => {
    const currentWeekDates = getNextDays();
    const isCurrentWeekDate = currentWeekDates.some(d => 
      d.toDateString() === date.toDateString()
    );

    return bookings.some(booking => 
      booking.time === time && 
      new Date(booking.date).toDateString() === date.toDateString() &&
      isCurrentWeekDate === (selectedWeek === 0)
    );
  };

  // Временные данные истории (в будущем будут приходить с сервера)
  const pointsHistory = [
    {
      id: 1,
      date: '2024-01-15',
      points: 2,
      type: 'Тренажерный зал',
      location: 'Горный',
      comment: null
    },
    {
      id: 2,
      date: '2024-01-16',
      points: 3,
      type: 'Секция по волейболу',
      location: 'Беляево',
      comment: 'Участие в секции по волейболу'
    },
    {
      id: 3,
      date: '2024-01-17',
      points: 2,
      type: 'Бассейн',
      location: 'Беляево',
      comment: null
    },
    {
      id: 4,
      date: '2024-01-18',
      points: 3,
      type: 'Секция по баскетболу',
      location: 'Горный',
      comment: 'Тренировка сборной института'
    },
    {
      id: 5,
      date: '2024-01-19',
      points: 2,
      type: 'Тренажерный зал',
      location: 'Беляево',
      comment: null
    },
    {
      id: 6,
      date: '2024-01-20',
      points: 3,
      type: 'Соревнования',
      location: 'Горный',
      comment: 'Участие в межфакультетских соревнованиях'
    },
    {
      id: 7,
      date: '2024-01-21',
      points: 4,
      type: 'Спартакиада',
      location: 'Горный',
      comment: 'Победа в командных соревнованиях'
    },
    {
      id: 8,
      date: '2024-01-22',
      points: 2,
      type: 'Бассейн',
      location: 'Беляево',
      comment: null
    },
    {
      id: 9,
      date: '2024-01-23',
      points: 3,
      type: 'Секция по теннису',
      location: 'Горный',
      comment: 'Тренировка начинающих'
    },
    {
      id: 10,
      date: '2024-01-24',
      points: 2,
      type: 'Тренажерный зал',
      location: 'Горный',
      comment: null
    }
  ];

  // Функция для фильтрации записей истории
  const filteredHistory = pointsHistory.filter(record => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.type.toLowerCase().includes(searchLower) ||
      record.location.toLowerCase().includes(searchLower) ||
      record.comment?.toLowerCase().includes(searchLower) ||
      new Date(record.date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).toLowerCase().includes(searchLower)
    );
  });

  // Функция для проверки и обновления недель
  const updateWeeks = () => {
    const now = new Date();
    const monday = new Date();
    while (monday.getDay() !== 1) {
      monday.setDate(monday.getDate() - 1);
    }
    monday.setHours(0, 0, 0, 0);

    // Если текущая дата больше понедельника следующей недели,
    // сдвигаем недели вперед
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    
    if (now >= nextMonday) {
      // Очищаем старые записи
      setBookings(prevBookings => 
        prevBookings.filter(booking => 
          new Date(booking.date) >= monday
        )
      );
      
      // Если мы смотрели следующую неделю, автоматически переключаемся на текущую
      if (selectedWeek === 1) {
        setSelectedWeek(0);
      }
      
      // Обновляем выбранную дату
      const days = getNextDays();
      if (days.length > 0) {
        setSelectedDate(days[0]);
        setSelectedTimes({});
      }
    }
  };

  // Эффект для обновления недель при загрузке и каждую полночь
  useEffect(() => {
    updateWeeks(); // Проверяем при загрузке

    // Вычисляем время до следующей полночи
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    // Устанавливаем таймер на полночь
    const timer = setTimeout(() => {
      updateWeeks();
      // После первого срабатывания устанавливаем интервал каждые 24 часа
      setInterval(updateWeeks, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const days = getNextDays();
    if (days.length > 0) {
      setSelectedDate(days[0]); // Выбираем первый день недели
      setSelectedTimes({}); // Сбрасываем выбранное время
    }
  }, [selectedWeek]);

  // Компонент модального окна истории
  const HistoryModal = () => (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: showHistory ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: '#333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>История баллов</h2>
          <button 
            onClick={() => {
              setShowHistory(false);
              setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по истории..."
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            Ничего не найдено
          </div>
        ) : (
          filteredHistory.map(record => (
            <div key={record.id} style={{
              padding: '12px',
              borderBottom: '1px solid #eee',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{record.type}</span>
                <span style={{ color: '#1976d2' }}>+{record.points} балла</span>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div>{record.location}</div>
                <div>{new Date(record.date).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
              {record.comment && (
                <div style={{ 
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  {record.comment}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="mobile-container">
      <header className="app-header">
        <h1 className="app-title">спорт <span className="misis-text">МИСИС</span></h1>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem('userType');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }}>Выйти</button>
      </header>

      <div className="navigation-container">
        <div className="top-section">
          <div className="location-buttons">
            <button
              className={`location-button ${selectedLocation === 'gorny' ? 'active' : ''}`}
              onClick={() => handleLocationChange('gorny')}
            >
              Горный
            </button>
            <button
              className={`location-button ${selectedLocation === 'belyaevo' ? 'active' : ''}`}
              onClick={() => handleLocationChange('belyaevo')}
            >
              Беляево
            </button>
          </div>
        </div>

        <div className="days-container center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setSelectedWeek(0)}
            disabled={selectedWeek === 0}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: selectedWeek === 0 ? 'default' : 'pointer',
              color: selectedWeek === 0 ? '#ccc' : '#1976d2',
              padding: '0 10px'
            }}
          >
            ←
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
          {getNextDays().map((date, index) => {
            const currentTime = serverTime || new Date();
            currentTime.setHours(0, 0, 0, 0);
            const isToday = date.getTime() === currentTime.getTime();
            
            console.log('Date:', date.toISOString(), 'Current:', currentTime.toISOString(), 'IsToday:', isToday);
            
            return (
              <button
                key={date.toISOString()}
                className={`day-button ${
                  selectedDate && date.getTime() === selectedDate.getTime() ? 'selected' : ''
                } ${isToday ? 'today' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                <span className="date">{getDateString(date)}</span>
                <span className="weekday">{getDayName(date)}</span>
              </button>
            );
          })}
          </div>
          <button 
            onClick={() => setSelectedWeek(1)}
            disabled={selectedWeek === 1}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: selectedWeek === 1 ? 'default' : 'pointer',
              color: selectedWeek === 1 ? '#ccc' : '#1976d2',
              padding: '0 10px'
            }}
          >
            →
          </button>
        </div>

        <div className="content-layout">
          <div className="halls-section" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            {HALLS[selectedLocation].map(hall => (
              <div key={hall.id} className="hall-card">
                <img src={hall.image || '/placeholder-hall.jpg'} alt={hall.name} className="hall-image" />
                <div className="hall-info">
                  <h3 className="hall-title">{hall.name}</h3>
                  <div className="time-slots-wrapper">
                    <div className="time-slots">
                      {Object.entries(hall.timeSlotCapacity).map(([time, timeCapacity]) => {
                        const isBooked = bookings.some(
                          booking => 
                            booking.hall === hall.name && 
                            booking.time === time && 
                            new Date(booking.date).getTime() === selectedDate.getTime()
                        );
                        const isMyBooking = bookings.some(
                          booking => 
                            booking.hall === hall.name &&
                            booking.time === time && 
                            new Date(booking.date).getTime() === selectedDate.getTime()
                        );
                        const timeConflict = hasTimeConflict(time, selectedDate) && !isMyBooking;
                        const isFull = timeCapacity.current >= timeCapacity.max;
                        
                        return (
                          <button
                            key={time}
                            className={`time-slot ${selectedTimes[hall.id] === time ? 'selected' : ''}`}
                            onClick={() => handleTimeSelect(hall.id, time)}
                            disabled={isBooked}
                            style={timeConflict ? {
                              backgroundColor: '#ffebee',
                              border: '1px solid #ffcdd2',
                              color: '#d32f2f',
                              cursor: 'not-allowed',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : isMyBooking ? {
                              backgroundColor: '#e3f2fd',
                              border: '1px solid #90caf9',
                              color: '#1976d2',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : isFull ? {
                              backgroundColor: '#eeeeee',
                              border: '1px solid #bdbdbd',
                              color: '#757575',
                              cursor: 'not-allowed',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : {
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            }}
                          >
                            {time}
                            {timeConflict && <div style={{ fontSize: '10px' }}>Уже записаны на это время</div>}
                            {isMyBooking && <div style={{ fontSize: '10px' }}>Записаны</div>}
                            {isFull && !timeConflict && !isMyBooking && <div style={{ fontSize: '10px' }}>Нет свободных мест</div>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="hall-capacity" style={{
                      opacity: selectedTimes[hall.id] ? 1 : 0,
                      transform: selectedTimes[hall.id] ? 'translateX(0)' : 'translateX(20px)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      marginLeft: '10px'
                    }}>
                      {selectedTimes[hall.id] && (
                        <>
                          <div style={{ fontSize: '14px', color: '#666' }}>Занято мест:</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            <span style={{ 
                              color: hall.timeSlotCapacity[selectedTimes[hall.id]]?.current >= hall.timeSlotCapacity[selectedTimes[hall.id]]?.max ? '#d32f2f' :
                                     hall.timeSlotCapacity[selectedTimes[hall.id]]?.current >= hall.timeSlotCapacity[selectedTimes[hall.id]]?.max * 0.8 ? '#f57c00' :
                                     '#2e7d32'
                            }}>
                              {hall.timeSlotCapacity[selectedTimes[hall.id]]?.current || 0}
                            </span>
                            <span style={{ color: '#333' }}>
                              /{hall.timeSlotCapacity[selectedTimes[hall.id]]?.max || 0}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    {selectedWeek === 1 && !isNextWeekBookingAllowed() && (
                      <div style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
                        Запись на следующую неделю доступна только в субботу и воскресенье
                      </div>
                    )}
                    <button
                      className="book-button"
                      onClick={() => handleBooking(hall.id)}
                      disabled={!selectedTimes[hall.id] || isBookingDisabled()}
                      style={{
                        backgroundColor: (!selectedTimes[hall.id] || isBookingDisabled()) ? '#ccc' : '#1976d2',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (!selectedTimes[hall.id] || isBookingDisabled()) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Записаться
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bookings-section">
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-info">
                  <div className="profile-name" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>{userData?.fullName || 'ФИО не указано'}</div>
                  <div className="profile-group" style={{ fontSize: '14px', marginBottom: '4px', color: '#555' }}>Группа: {userData?.group || 'Не указана'}</div>
                  <div className="profile-student-id" style={{ fontSize: '14px', color: '#555' }}>Студ. билет: {userData?.studentId || 'Не указан'}</div>
                </div>
              </div>
            </div>

            <div className="points-section" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ marginBottom: '8px', color: '#333', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Текущие баллы</span>
                <span>{userData?.points || 0} / 100</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${userData?.points || 0}%`, 
                    height: '100%', 
                    background: `
                      linear-gradient(45deg, 
                        #00548f 0%, 
                        #0072bc 20%,
                        #00548f 35%,
                        #0072bc 50%,
                        #00548f 65%,
                        #0072bc 80%,
                        #00548f 100%
                      )
                    `,
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Мои записи</h2>
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  background: 'none',
                  border: '1px solid #1976d2',
                  color: '#1976d2',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                История
              </button>
            </div>

            <div className="bookings-list" style={{
              maxHeight: '400px',
              overflowY: 'auto',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}>
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <h3>{booking.location} - {booking.hall}</h3>
                    <div className="booking-details">
                      <span className="booking-date">
                        {new Date(booking.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric',
                          month: 'long'
                        })}
                      </span>
                      <span className="booking-time">{booking.time}</span>
                    </div>
                  </div>
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setBookings(bookings.filter(b => b.id !== booking.id));
                    }}
                  >
                    Отменить
                  </button>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="no-bookings">
                  У вас пока нет записей
                </div>
              )}
            </div>
          </div>
        </div>

        {notification.show && (
          <div className="notification show">
            <div className="notification-icon">!</div>
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: '' })}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Добавляем модальное окно истории */}
      <HistoryModal />
    </div>
  );
};

export default StudentView;
