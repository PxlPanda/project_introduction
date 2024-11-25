import React, { useState, useEffect } from 'react';
import './main.css';

const HALLS = {
  'gorny': [
    {
      id: 1,
      name: 'Тренажерный зал',
      image: '/images/gym.jpg',
      capacity: 30,
      currentCapacity: 15
    },
    {
      id: 2,
      name: 'Игровой зал',
      image: '/images/game.jpg',
      capacity: 20,
      currentCapacity: 8
    },
    {
      id: 3,
      name: 'Зал фитнеса',
      image: '/images/fitness.jpg',
      capacity: 25,
      currentCapacity: 12
    },
    {
      id: 4,
      name: 'Зал для бокса',
      image: '/images/boxing.jpg',
      capacity: 15,
      currentCapacity: 6
    }
  ],
  'belyaevo': [
    {
      id: 5,
      name: 'Бассейн',
      image: '/images/pool.jpg',
      capacity: 40,
      currentCapacity: 20
    },
    {
      id: 6,
      name: 'Игровой зал',
      image: '/images/game.jpg',
      capacity: 25,
      currentCapacity: 10
    },
    {
      id: 7,
      name: 'Зал фитнеса',
      image: '/images/fitness.jpg',
      capacity: 20,
      currentCapacity: 8
    }
  ]
};

const USER_DATA = {
  name: "Иванов Иван Иванович",
  group: "БПИ228",
  studentId: "22Б0000",
  points: 75,
  maxPoints: 100,
  bookings: [
    { id: 1, hall: "Тренажерный зал", date: "2024-01-20", time: "14:00" },
    { id: 2, hall: "Зал фитнеса", date: "2024-01-21", time: "16:00" }
  ]
};

const Main = () => {
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

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const savedUserData = localStorage.getItem('userData');
    if (!savedUserData) {
      window.location.href = '/login';
      return;
    }

    // Парсим данные пользователя для использования
    const userData = JSON.parse(savedUserData);
    // Здесь можно использовать данные пользователя
    // Например, отображать имя, группу и т.д.
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message) => {
    setNotification({ show: true, message });
  };

  const getDayName = (date) => {
    if (!(date instanceof Date)) return '';
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  };

  const getDateString = (date) => {
    if (!(date instanceof Date)) return '';
    return date.getDate().toString();
  };

  const getDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handleDayChange = (dayIndex) => {
    try {
      setSelectedDay(dayIndex);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + dayIndex);
      setSelectedDate(newDate);
    } catch (error) {
      console.error('Error in handleDayChange:', error);
    }
  };

  const isSlotBooked = (hall, time) => {
    try {
      if (!selectedDate || !(selectedDate instanceof Date)) return false;
      const dateStr = selectedDate.toISOString().split('T')[0];
      return bookings.some(
        (b) =>
          b.hall === hall.name &&
          b.date === dateStr &&
          b.time === (time || selectedTimes[hall.id] || '10:00')
      );
    } catch (error) {
      console.error('Error in isSlotBooked:', error);
      return false;
    }
  };

  const days = React.useMemo(() => {
    try {
      return getDays().map((date, index) => ({
        date: getDateString(date),
        weekday: getDayName(date),
        isToday: date.toDateString() === new Date().toDateString()
      }));
    } catch (error) {
      console.error('Error in days calculation:', error);
      return [];
    }
  }, []);

  const handleTimeChange = (hallId, direction) => {
    const currentTime = selectedTimes[hallId] || '10:00';
    const [hours] = currentTime.split(':').map(Number);
    
    let newHours = direction === 'next' ? hours + 2 : hours - 2;
    if (newHours < 10) newHours = 20;
    if (newHours > 20) newHours = 10;
    
    setSelectedTimes({
      ...selectedTimes,
      [hallId]: `${newHours}:00`
    });
  };

  const handleBooking = (hall) => {
    const time = selectedTimes[hall.id] || '10:00';
    const date = selectedDate.toISOString().split('T')[0];

    const hasBookingAtSameTime = bookings.some(booking => 
      booking.date === date && booking.time === time
    );

    if (hasBookingAtSameTime) {
      showNotification('У вас уже есть запись на это время в другом зале');
      return;
    }

    const newBooking = {
      id: bookings.length + 1,
      hall: hall.name,
      date: date,
      time: time
    };
    setBookings([...bookings, newBooking]);
  };

  const handleCancelBooking = (bookingId) => {
    setBookings(bookings.filter(booking => booking.id !== bookingId));
  };

  const formatBookingDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'long'
    });
  };

  const getLocationForHall = (hallName) => {
    if (HALLS['gorny'].some(h => h.name === hallName)) {
      return 'Горный';
    }
    return 'Беляево';
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="mobile-container">
      {notification.show && (
        <div className="notification show">
          <div className="notification-icon">!</div>
          <div className="notification-content">
            <div className="notification-title">Внимание</div>
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

      <header className="app-header" style={{ background: 'white' }}>
        <h1 className="app-title" style={{ color: '#0a1e64' }}>спорт <span className="misis-text">МИСИС</span></h1>
        <button className="logout-button" onClick={handleLogout}>Выйти</button>
      </header>

      <nav className="navigation-container">
        <div className="nav-content">
          <div className="nav-layout">
            <div className="nav-main">
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
              
              <div className="days-container">
                {days.map((day, index) => (
                  <button
                    key={index}
                    className={`day-button ${selectedDay === index ? 'selected' : ''} ${day.isToday ? 'today' : ''}`}
                    onClick={() => handleDayChange(index)}
                  >
                    <span className="date">{day.date}</span>
                    <span className="weekday">{day.weekday}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-data">
              <h3>Профиль</h3>
              <div className="profile-info">
                <p><strong>ФИО:</strong> {USER_DATA.name}</p>
                <p><strong>Группа:</strong> {USER_DATA.group}</p>
                <p><strong>Студ. билет:</strong> {USER_DATA.studentId}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="halls-section">
          {HALLS[selectedLocation].map((hall) => (
            <div key={hall.id} className="hall-card">
              <div className="hall-image">
                <img src={hall.image} alt={hall.name} />
              </div>
              <div className="hall-content">
                <div className="hall-header">
                  <h3 className="hall-name">{hall.name}</h3>
                  <div className="capacity-indicator">
                    <div className="capacity-bar">
                      <div
                        className="capacity-fill"
                        style={{
                          width: `${(hall.currentCapacity / hall.capacity) * 100}%`,
                          backgroundColor:
                            (hall.currentCapacity / hall.capacity) > 0.8
                              ? 'var(--color-danger)'
                              : (hall.currentCapacity / hall.capacity) > 0.5
                              ? 'var(--color-warning)'
                              : 'var(--color-success)'
                        }}
                      />
                    </div>
                    <span className="capacity-text">
                      {hall.currentCapacity}/{hall.capacity}
                    </span>
                  </div>
                </div>

                <div className="time-control">
                  <button
                    className="time-nav-button"
                    onClick={() => handleTimeChange(hall.id, 'prev')}
                  >
                    ←
                  </button>
                  <span className="time-display">
                    {selectedTimes[hall.id] || '10:00'}
                  </span>
                  <button
                    className="time-nav-button"
                    onClick={() => handleTimeChange(hall.id, 'next')}
                  >
                    →
                  </button>
                </div>

                <button
                  className={`book-button ${
                    isSlotBooked(hall, selectedTimes[hall.id])
                      ? 'booked'
                      : ''
                  }`}
                  onClick={() => handleBooking(hall)}
                  disabled={
                    hall.currentCapacity >= hall.capacity ||
                    isSlotBooked(hall, selectedTimes[hall.id])
                  }
                >
                  {isSlotBooked(hall, selectedTimes[hall.id])
                    ? 'Записано'
                    : 'Записаться'}
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="user-section">
          <div className="points-section">
            <h3>Баллы</h3>
            <div className="points-label">Текущие баллы</div>
            <div className="points-progress">
              <div className="points-bar">
                <div 
                  className="points-fill"
                  style={{
                    width: `${(USER_DATA.points / USER_DATA.maxPoints) * 100}%`
                  }}
                />
              </div>
              <div className="points-text">
                {USER_DATA.points} / {USER_DATA.maxPoints}
              </div>
            </div>
          </div>

          <div className="bookings-section">
            <div className="bookings-header">
              <h3>Мои записи</h3>
              <button className="history-button" onClick={() => setShowHistory(true)}>
                История
              </button>
            </div>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    {booking.hall} • {formatBookingDate(booking.date)} • {booking.time} • {getLocationForHall(booking.hall)}
                  </div>
                  <button
                    className="cancel-booking"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Main;
