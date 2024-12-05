import React, { useState, useEffect, useRef } from 'react';
import '../styles/base.css';
import '../styles/navigation.css';
import '../styles/hall-card.css';
import '../styles/buttons.css';
import '../styles/header.css';
import '../styles/calendar.css';

const defaultHalls = {
  'Горный': [
    {
      id: 1,
      name: 'Тренажерный зал',
      capacity: 20,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 20 },
        '10:50': { current: 0, max: 20 },
        '12:40': { current: 0, max: 20 },
        '14:30': { current: 0, max: 20 },
        '16:30': { current: 0, max: 20 },
        '18:20': { current: 0, max: 20 },
      }
    },
    {
      id: 2,
      name: 'Игровой зал',
      capacity: 30,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 30 },
        '10:50': { current: 0, max: 30 },
        '12:40': { current: 0, max: 30 },
        '14:30': { current: 0, max: 30 },
        '16:30': { current: 0, max: 30 },
        '18:20': { current: 0, max: 30 },
      }
    },
    {
      id: 3,
      name: 'Зал для фитнеса',
      capacity: 15,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 15 },
        '10:50': { current: 0, max: 15 },
        '12:40': { current: 0, max: 15 },
        '14:30': { current: 0, max: 15 },
        '16:30': { current: 0, max: 15 },
        '18:20': { current: 0, max: 15 },
      }
    },
    {
      id: 4,
      name: 'Зал для бокса',
      capacity: 10,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 10 },
        '10:50': { current: 0, max: 10 },
        '12:40': { current: 0, max: 10 },
        '14:30': { current: 0, max: 10 },
        '16:30': { current: 0, max: 10 },
        '18:20': { current: 0, max: 10 },
      }
    }
  ],
  'Беляево': [
    {
      id: 5,
      name: 'Тренажерный зал',
      capacity: 25,
      timeSlotCapacity: {
        '8:30': { current: 0, max: 25 },
        '10:10': { current: 0, max: 25 },
        '11:50': { current: 0, max: 25 },
        '13:30': { current: 0, max: 25 },
      }
    },
    {
      id: 6,
      name: 'Игровой зал',
      capacity: 35,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 35 },
        '10:10': { current: 0, max: 35 },
        '11:50': { current: 0, max: 35 },
        '13:30': { current: 0, max: 35 },
      }
    },
    {
      id: 7,
      name: 'Бассейн',
      capacity: 8,
      timeSlotCapacity: {
        '9:00': { current: 0, max: 8 },
        '10:10': { current: 0, max: 8 },
        '11:50': { current: 0, max: 8 },
        '13:30': { current: 0, max: 8 },
      }
    }
  ]
};

const HALLS = {
  gorny: defaultHalls['Горный'],
  belyaevo: defaultHalls['Беляево']
};

// Временные слоты
const TIME_SLOTS = {
  gorny: ['9:00', '10:50', '12:40', '14:30', '16:30', '18:20'],
  belyaevo: ['8:30', '10:10', '11:50', '13:30']
};

const getLessonNumber = (time, location) => {
  const slots = TIME_SLOTS[location.toLowerCase()];
  return slots ? slots.indexOf(time) + 1 : 0;
};

// Функция для проверки конфликта времени
const checkTimeConflict = (booking, selectedTime, selectedDate, selectedLocation) => {
  console.log('Checking conflict for:', {
    booking,
    selectedTime,
    selectedDate: selectedDate.toISOString(),
    selectedLocation
  });

  // Проверяем совпадение даты
  const bookingDate = new Date(booking.date);
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const bookingDateStr = bookingDate.toISOString().split('T')[0];
  
  console.log('Comparing dates:', {
    bookingDate: bookingDateStr,
    selectedDate: selectedDateStr
  });

  if (selectedDateStr !== bookingDateStr) {
    console.log('Dates do not match');
    return false;
  }

  // Определяем номер пары для текущего слота
  const currentLessonNumber = getLessonNumber(selectedTime, selectedLocation);
  
  // Определяем номер пары для существующей брони
  const bookingLocation = booking.location.toLowerCase() === 'горный' ? 'gorny' : 'belyaevo';
  const bookingLessonNumber = getLessonNumber(booking.time, bookingLocation);
  
  console.log('Comparing lesson numbers:', {
    currentLessonNumber,
    bookingLessonNumber
  });

  return currentLessonNumber === bookingLessonNumber;
};

const StudentView = () => {
  console.log('StudentView rendering');  // Добавьте эту строку в начало компонента

  const [studentProfile, setStudentProfile] = useState({
    fullName: '',
    group: '',
    studentId: ''
  });
  
  const [pointsHistory, setPointsHistory] = useState([]);  // Для истории баллов
  const [currentPoints, setCurrentPoints] = useState(0);  // Для текущих баллов
  const [serverTime, setServerTime] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('gorny');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
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
  const prevDateRef = useRef(null);
  const [halls, setHalls] = useState({
    gorny: [],
    belyaevo: []
  });

  const getNextDays = React.useCallback(() => {
    const days = [];
    const today = serverTime ? new Date(serverTime) : new Date();
    
    if (isNaN(today.getTime())) {
      console.error('Invalid server time, using current time');
      today = new Date();
    }
    
    today.setHours(0, 0, 0, 0);
    
    const currentDay = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    if (selectedWeek === 1) {
      startDate.setDate(startDate.getDate() + 7);
    }
    
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + i);
      if (!isNaN(nextDate.getTime())) {
        days.push(nextDate);
      }
    }
    
    return days;
  }, [selectedWeek, serverTime]);
  
  useEffect(() => {
    const initializeComponent = async () => {
      // Проверка авторизации
      const savedUserData = localStorage.getItem('userData');
      if (!savedUserData) {
        window.location.href = '/login';
        return;
      }
      
      // Инициализация всех данных
      setUserData(JSON.parse(savedUserData));
      await fetchStudentProfile();
      await fetchServerTime();
    };
    
    initializeComponent();
    
    // Интервал для обновления времени
    const timeInterval = setInterval(fetchServerTime, 60000);
    return () => clearInterval(timeInterval);
  }, []); // Пустой массив зависимостей - выполнится только при монтировании
  const fetchHalls = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }
  
      const locationName = selectedLocation === 'gorny' ? 'Горный' : 'Беляево';
      const formattedDate = selectedDate.toISOString().split('T')[0];
  
      const response = await fetch(
        `http://127.0.0.1:8000/leads/halls/?location=${encodeURIComponent(locationName)}&date=${formattedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch halls');
      }
  
      const data = await response.json();
      
      // Преобразуем данные в нужный формат
      // В функции fetchHalls измените эту часть:
      const formattedHalls = data.map(hall => ({
        id: hall.id,
        name: hall.name,
        capacity: hall.capacity,
        timeSlotCapacity: TIME_SLOTS[selectedLocation].reduce((acc, time) => {
          const bookingsForTime = hall.bookings?.filter(b => b.time_slot === time) || [];
          acc[time] = {
            current: bookingsForTime.length,
            max: hall.capacity
          };
          return acc;
        }, {})
      }));
  
      // Обновляем состояние, сохраняя предыдущие данные для другой локации
      setHalls(prev => ({
        ...prev,
        [selectedLocation]: formattedHalls
      }));
    } catch (error) {
      console.error('Error fetching halls:', error);
    }
  };
  
  const getLessonNumber = (time, location) => {
    const gornyTimes = ['9:00', '10:50', '12:40', '14:30', '16:30', '18:20'];
    const belyaevoTimes = ['8:30', '10:10', '11:50', '13:30'];
    const times = location === 'gorny' ? gornyTimes : belyaevoTimes;
    return times.indexOf(time) + 1;
  };

  const handleBooking = async (hallId) => {
    try {
      const token = localStorage.getItem('token');
      const hall = halls[selectedLocation].find(h => h.id === hallId);
      
      if (!hall) {
        throw new Error('Hall not found');
      }
      
      const response = await fetch('http://127.0.0.1:8000/leads/bookings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hall_id: hallId,
          date: selectedDate.toISOString().split('T')[0],
          time_slot: selectedTimes[hallId],
          location: selectedLocation === 'gorny' ? 'Горный' : 'Беляево'
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create booking');
      }
  
      const data = await response.json();
      
      // Обновляем локальное состояние
      const newBooking = {
        id: data.id,
        location: selectedLocation === 'gorny' ? 'Горный' : 'Беляево',
        hall: hall.name,
        date: selectedDate,
        time: selectedTimes[hallId]
      };
      
      setBookings(prev => [...prev, newBooking]);
      
      // Обновляем состояние залов локально
      setHalls(prev => {
        const updatedHalls = prev[selectedLocation].map(h => {
          if (h.id === hallId) {
            const updatedTimeSlots = { ...h.timeSlotCapacity };
            const selectedTime = selectedTimes[hallId];
            if (updatedTimeSlots[selectedTime]) {
              updatedTimeSlots[selectedTime].current += 1;
            }
            return { ...h, timeSlotCapacity: updatedTimeSlots };
          }
          return h;
        });
        return { ...prev, [selectedLocation]: updatedHalls };
      });
      
      // Сбрасываем выбранное время
      setSelectedTimes(prev => ({ ...prev, [hallId]: null }));
      
      showNotification('Запись успешно создана');
    } catch (error) {
      console.error('Error creating booking:', error);
      showNotification(error.message || 'Ошибка при создании записи');
    }
  };

  const fetchHallOccupancy = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        window.location.href = '/login';
        return;
      }
  
      // Проверяем, что selectedDate существует
      if (!selectedDate) {
        console.error('No date selected');
        return;
      }
  
      const formattedDate = selectedDate.toISOString().split('T')[0];
      console.log('Fetching halls for date:', formattedDate);
  
      const response = await fetch(
        `http://127.0.0.1:8000/leads/halls/?date=${formattedDate}&location=${selectedLocation}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch hall occupancy');
      }
  
      const data = await response.json();
      console.log('Received halls data:', data);
      
      setHalls(prevHalls => ({
        ...prevHalls,
        [selectedLocation]: data
      }));
    } catch (error) {
      console.error('Error fetching hall occupancy:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не найден токен авторизации');
      }
  
      console.log('Fetching bookings...');
      const response = await fetch('http://127.0.0.1:8000/leads/bookings/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при загрузке бронирований');
      }
  
      const data = await response.json();
      console.log('Raw bookings response:', data);
  
      if (!data.bookings) {
        console.error('Unexpected bookings data structure:', data);
        setBookings([]);
        return;
      }
  
      const formattedBookings = data.bookings.map(booking => {
        console.log('Processing booking:', booking);
        return {
          id: booking.id,
          hall: booking.hall.name,
          location: booking.location,
          date: new Date(booking.date), // Преобразуем в объект Date
          time: booking.time_slot
        };
      });
      
      console.log('Formatted bookings:', formattedBookings);
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setNotification({
        show: true,
        message: error.message || 'Ошибка при загрузке бронирований'
      });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не найден токен авторизации');
      }
  
      const response = await fetch(`/leads/bookings/${bookingId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при отмене записи');
      }
      
      // Обновляем локальное состояние
      const canceledBooking = bookings.find(b => b.id === bookingId);
      if (canceledBooking) {
        setHalls(prev => {
          const location = canceledBooking.location === 'Горный' ? 'gorny' : 'belyaevo';
          const updatedHalls = prev[location].map(hall => {
            if (hall.name === canceledBooking.hall) {
              const updatedTimeSlots = { ...hall.timeSlotCapacity };
              if (updatedTimeSlots[canceledBooking.time]) {
                updatedTimeSlots[canceledBooking.time].current -= 1;
              }
              return { ...hall, timeSlotCapacity: updatedTimeSlots };
            }
            return hall;
          });
          return { ...prev, [location]: updatedHalls };
        });
      }
      
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      
      setNotification({
        show: true,
        message: 'Запись успешно отменена'
      });
    } catch (error) {
      console.error('Error canceling booking:', error);
      setNotification({
        show: true,
        message: error.message || 'Ошибка при отмене записи'
      });
    }
  };

  // Функция fetchStudentProfile
  const fetchStudentProfile = async () => {
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        window.location.href = '/login';
        return;
      }
  
      console.log('Fetching student profile with token:', token);
      const response = await fetch('http://127.0.0.1:8000/leads/student-data/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch student data');
      }
  
      const data = await response.json();
      console.log('Received student data:', data);
      
      
      setStudentProfile({
        fullName: data.full_name,
        group: data.group,
        studentId: data.student_id
      });

      const profileData = {
        fullName: data.full_name,
        group: data.group,
        studentId: data.student_id
      };
      console.log('Setting profile data:', profileData);
      setStudentProfile(profileData);

      setPointsHistory(data.points_history?.map(record => ({
        id: record.id,
        date: new Date(record.date).toLocaleString(),
        points: record.points,
        reason: record.reason,
        type: record.type,
        awardedBy: record.awarded_by
      })) || []);
      setCurrentPoints(data.current_points || 0);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudentProfile({
        fullName: 'Не указано',
        group: 'Не указана',
        studentId: 'Не указан'
      });
      setPointsHistory([]);
      setCurrentPoints(0);
    }
  };

// JSX для отображения профиля (вставьте в return компонента)
<div className="student-profile" style={{
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '20px'
}}>
  <h2 style={{ color: '#333', marginBottom: '15px' }}>Профиль студента</h2>
  <div style={{ marginBottom: '10px' }}>
    <strong>ФИО:</strong> {studentProfile?.fullName || 'Не указано'}
  </div>
  <div style={{ marginBottom: '10px' }}>
    <strong>Группа:</strong> {studentProfile?.group || 'Не указана'}
  </div>
  <div style={{ marginBottom: '10px' }}>
    <strong>Номер студенческого:</strong> {studentProfile?.studentId || 'Не указан'}
  </div>

  <div className="points-history-section">
    <h3>История баллов</h3>
    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Баллы</th>
          <th>Причина</th>
          <th>Тип</th>
          <th>Кем начислено</th>
        </tr>
      </thead>
      <tbody>
      {Array.isArray(pointsHistory) && pointsHistory.map((record) => (
          <tr key={record.id}>
            <td>{record.date}</td>
            <td>{record.points}</td>
            <td>{record.reason}</td>
            <td>{record.type}</td>
            <td>{record.awardedBy || 'Система'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

const fetchServerTime = async () => {
  try {
    console.log('Fetching server time...');
    const response = await fetch('http://127.0.0.1:8000/leads/server-time/');
    if (!response.ok) {
      throw new Error('Failed to fetch server time');
    }
    const data = await response.json();
    console.log('Server response:', data);
    
    if (data.server_time) {
      const serverDateTime = new Date(data.server_time);
      if (!isNaN(serverDateTime.getTime())) {
        console.log('Setting server time:', serverDateTime.toISOString());
        setServerTime(serverDateTime);
      } else {
        console.error('Invalid server time format:', data.server_time);
        setServerTime(new Date()); // Используем локальное время как запасной вариант
      }
    } else {
      console.error('No server_time in response');
      setServerTime(new Date()); // Используем локальное время как запасной вариант
    }
  } catch (error) {
    console.error('Error fetching server time:', error);
    setServerTime(new Date()); // Используем локальное время как запасной вариант
  }
};

useEffect(() => {
  const loadHalls = async () => {
    if (selectedDate && selectedLocation) {
      const currentDate = selectedDate.toISOString().split('T')[0];
      const locationKey = `${selectedLocation}-${currentDate}`;
      
      if (locationKey !== prevDateRef.current) {
        prevDateRef.current = locationKey;
        await fetchHalls();
        await fetchBookings(); // Добавим и обновление записей
      }
    }
  };
  
  loadHalls();
}, [selectedDate, selectedLocation]);

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
    if (selectedDate) {
      fetchHalls();
    }
  }, [selectedDate, selectedLocation]);

  const getDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.getDate().toString().padStart(2, '0') + '.' + 
           (d.getMonth() + 1).toString().padStart(2, '0');
  };
  
  const getDayName = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[d.getDay()];
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedTimes({});
  };

  const handleDateSelect = (date) => {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date selected');
      return;
    }
    
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    
    if (isNaN(newDate.getTime())) {
      console.error('Invalid date after conversion');
      return;
    }
    
    console.log('Selecting new date:', newDate.toISOString());
    setSelectedDate(newDate);
  };

  const handleTimeSelect = async (hallId, time) => {
    // Если время уже выбрано, отменяем выбор
    if (selectedTimes[hallId] === time) {
      setSelectedTimes(prev => ({
        ...prev,
        [hallId]: null
      }));
    } else {
      // Иначе выбираем новое время
      setSelectedTimes(prev => ({
        ...prev,
        [hallId]: time
      }));
    }
  };

  const isBookingDisabled = () => {
    return selectedWeek === 1 && !isNextWeekBookingAllowed();
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
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

  // При рендеринге кнопок времени
  const hasTimeConflict = (time) => {
    console.log('Checking conflicts for time:', time);
    return bookings.some(booking => {
      const conflict = checkTimeConflict(booking, time, selectedDate, selectedLocation);
      console.log('Conflict check result:', { booking, conflict });
      return conflict;
    });
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

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

  // Периодическое обновление данных каждые 30 секунд
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      // Проверяем, что у нас есть выбранная дата и она валидна
      if (selectedDate && !isNaN(selectedDate.getTime())) {
        // Сохраняем текущее состояние halls перед обновлением
        const prevHalls = halls[selectedLocation];
        
        // Получаем новые данные
        await fetchHalls();
        await fetchBookings();
        
        // Если данные изменились, React автоматически обновит UI
        // Если нет - обновления UI не будет
      }
    }, 30000); // 30 секунд

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(updateInterval);
  }, [selectedDate, selectedLocation]); // Добавляем зависимости

  // Эффект для обновления недель при загрузке и каждую полночь
  useEffect(() => {
    updateWeeks();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;
  
    const timer = setTimeout(() => {
      updateWeeks();
      const dailyTimer = setInterval(updateWeeks, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);
  
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const days = getNextDays();
    if (days.length > 0) {
      // Проверяем, действительно ли дата изменилась
      const newDate = days[0];
      if (!selectedDate || 
          newDate.getDate() !== selectedDate.getDate() || 
          newDate.getMonth() !== selectedDate.getMonth() || 
          newDate.getFullYear() !== selectedDate.getFullYear()) {
        setSelectedDate(newDate);
        setSelectedTimes({});
      }
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
            if (!date || isNaN(date.getTime())) {
              console.error('Invalid date in getNextDays');
              return null;
            }

            const currentTime = serverTime ? new Date(serverTime) : new Date();
            if (isNaN(currentTime.getTime())) {
              console.error('Invalid server time');
              currentTime = new Date();
            }
            
            currentTime.setHours(0, 0, 0, 0);
            
            // Форматируем даты для сравнения
            const dateStr = date.toISOString().split('T')[0];
            const currentStr = currentTime.toISOString().split('T')[0];
            const selectedStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
            
            const isToday = dateStr === currentStr;
            
            return (
              <button
                key={dateStr}
                className={`day-button ${
                  selectedStr && dateStr === selectedStr ? 'selected' : ''
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
            {halls[selectedLocation].map(hall => (
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
                          new Date(booking.date).getTime() === selectedDate.getTime() &&
                          booking.location === (selectedLocation === 'gorny' ? 'Горный' : 'Беляево')
                      );
                      const timeConflict = bookings.some(booking => 
                        checkTimeConflict(booking, time, selectedDate, selectedLocation)
                      );
                      const isFull = timeCapacity.current >= timeCapacity.max;
                      const isPast = isPastDate(selectedDate);
                      
                      return (
                        <button
                          key={time}
                          className={`time-slot ${selectedTimes[hall.id] === time ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(hall.id, time)}
                          disabled={isPast || timeConflict}
                          style={
                            isPast ? {
                              backgroundColor: '#f5f5f5',
                              border: '1px solid #e0e0e0',
                              color: '#bdbdbd',
                              cursor: 'not-allowed',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : timeConflict ? {
                              backgroundColor: '#ffebee',
                              border: '1px solid #ffcdd2',
                              color: '#d32f2f',
                              cursor: 'pointer',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : isMyBooking ? {
                              backgroundColor: '#e3f2fd',
                              border: '1px solid #90caf9',
                              color: '#1976d2',
                              cursor: 'pointer',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : isFull ? {
                              backgroundColor: '#eeeeee',
                              border: '1px solid #bdbdbd',
                              color: '#757575',
                              cursor: 'pointer',
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px'
                            } : {
                              minWidth: '90px',
                              width: '90px',
                              padding: '8px 4px',
                              cursor: 'pointer'
                            }
                          }
                        >
                          {time}
                          {isPast && <div style={{ fontSize: '10px' }}>Прошедший день</div>}
                          {timeConflict && !isPast && <div style={{ fontSize: '10px' }}>Уже записаны на это время</div>}
                          {isMyBooking && <div style={{ fontSize: '10px' }}>Записаны</div>}
                          {isFull && !timeConflict && !isMyBooking && !isPast && <div style={{ fontSize: '10px' }}>Нет свободных мест</div>}
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
                  <div className="profile-name" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
                    {studentProfile?.fullName || 'ФИО не указано'}
                  </div>
                  <div className="profile-group" style={{ fontSize: '14px', marginBottom: '4px', color: '#555' }}>
                    Группа: {studentProfile?.group || 'Не указана'}
                  </div>
                  <div className="profile-student-id" style={{ fontSize: '14px', color: '#555' }}>
                    Студ. билет: {studentProfile?.studentId || 'Не указан'}
                  </div>
                </div>
              </div>
            </div>
  
            <div className="points-section" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ marginBottom: '8px', color: '#333', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Текущие баллы</span>
                <span>{currentPoints} / 100</span>
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
                      handleCancelBooking(booking.id);
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
