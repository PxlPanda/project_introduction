import React, { useState, useEffect } from 'react';
import { HALLS } from '../constants/halls';
import { timeSlots } from '../constants/timeSlots';
import '../styles/base.css';
import '../styles/navigation.css';
import '../styles/hall-card.css';
import '../styles/buttons.css';
import '../styles/header.css';
import '../styles/calendar.css';

const TeacherView = () => {
  const [selectedLocation, setSelectedLocation] = useState('gorny');
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [studentsForTimeSlot, setStudentsForTimeSlot] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [userData, setUserData] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState({});
  const [pointsReasons, setPointsReasons] = useState({});
  const [hallCapacities, setHallCapacities] = useState({});

  const mockStudents = [
    { id: 1, name: 'Иванов Иван', group: 'БПМ-20-1', attendance: [], currentPoints: 65 },
    { id: 2, name: 'Петров Петр', group: 'БПМ-20-2', attendance: [], currentPoints: 45 },
    { id: 3, name: 'Сидоров Сидор', group: 'БПМ-20-1', attendance: [], currentPoints: 80 },
    { id: 4, name: 'Смирнова Анна', group: 'БПМ-20-2', attendance: [], currentPoints: 72 },
    { id: 5, name: 'Козлов Дмитрий', group: 'БПМ-20-3', attendance: [], currentPoints: 58 },
    { id: 6, name: 'Морозова Елена', group: 'БПМ-20-1', attendance: [], currentPoints: 90 },
    { id: 7, name: 'Волков Артем', group: 'БПМ-20-3', attendance: [], currentPoints: 63 },
    { id: 8, name: 'Соколова Мария', group: 'БПМ-20-2', attendance: [], currentPoints: 77 },
    { id: 9, name: 'Попов Александр', group: 'БПМ-20-1', attendance: [], currentPoints: 85 },
    { id: 10, name: 'Лебедева Ольга', group: 'БПМ-20-3', attendance: [], currentPoints: 69 }
  ];

  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (!savedUserData) {
      window.location.href = '/login';
      return;
    }
    setUserData(JSON.parse(savedUserData));
  }, []);

  const handleMarkAttendance = (hall) => {
    const selectedTime = selectedTimeSlots[hall.id];
    if (!selectedTime) {
      showNotification('Выберите время пары');
      return;
    }
    setShowStudentsList(true);
    // В реальном приложении здесь будет запрос к API для получения студентов на конкретное время
    setStudentsForTimeSlot(mockStudents);
    // Устанавливаем значение по умолчанию 10 баллов для всех студентов
    const defaultPoints = {};
    mockStudents.forEach(student => {
      defaultPoints[student.id] = 10;
    });
    setSelectedPoints(defaultPoints);
  };

  const handleSearch = () => {
    const filteredStudents = mockStudents.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchName.toLowerCase());
      const groupMatch = !searchGroup || student.group === searchGroup;
      return nameMatch && groupMatch;
    });
    setStudentsForTimeSlot(filteredStudents);
  };

  useEffect(() => {
    handleSearch();
  }, [searchName, searchGroup]);

  const handlePointsChange = (studentId, points) => {
    setSelectedPoints(prev => ({
      ...prev,
      [studentId]: Math.min(Math.max(0, points), 10)
    }));
  };

  const handleReasonChange = (studentId, reason) => {
    setPointsReasons(prev => ({
      ...prev,
      [studentId]: reason
    }));
  };

  const handleSavePoints = () => {
    // TODO: Здесь будет отправка данных на сервер
    console.log('Сохраняем баллы:', selectedPoints);
    console.log('Причины:', pointsReasons);
    showNotification('Баллы успешно сохранены');
    setShowStudentsList(false);
  };

  const fetchHallCapacity = async (hallId, time) => {
    // TODO: Здесь будет реальный запрос к API
    // Пока используем моковые данные
    const mockCapacities = {
      '8:30': { current: 15, max: 30 },
      '10:10': { current: 25, max: 30 },
      '11:50': { current: 10, max: 30 },
      '13:30': { current: 20, max: 30 },
      '15:10': { current: 5, max: 30 },
      '16:50': { current: 28, max: 30 },
      '18:30': { current: 12, max: 30 },
    };

    // Имитация задержки запроса
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockCapacities[time] || { current: 0, max: 30 };
  };

  const handleTimeSelect = async (hallId, time) => {
    setSelectedTimeSlots(prev => ({
      ...prev,
      [hallId]: time
    }));

    // Получаем данные о заполненности для выбранного времени
    const capacity = await fetchHallCapacity(hallId, time);
    setHallCapacities(prev => ({
      ...prev,
      [`${hallId}_${time}`]: capacity
    }));
  };

  const StudentsList = () => {
    const uniqueGroups = [...new Set(mockStudents.map(student => student.group))];
    
    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '95%',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          color: '#333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Поиск студентов</h2>
            <button 
              onClick={() => setShowStudentsList(false)}
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
          
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Поиск по ФИО"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{
                flex: 2,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <select
              value={searchGroup}
              onChange={(e) => setSearchGroup(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Все группы</option>
              {uniqueGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            marginBottom: '20px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
          }}>
            {studentsForTimeSlot.map(student => (
              <div key={student.id} style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{student.group}</div>
                </div>
                <div style={{ flex: 2 }}>
                  <input
                    type="text"
                    placeholder="Причина начисления баллов"
                    value={pointsReasons[student.id] || ''}
                    onChange={(e) => handleReasonChange(student.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={selectedPoints[student.id] || 0}
                    onChange={(e) => handlePointsChange(student.id, parseInt(e.target.value) || 0)}
                    style={{
                      width: '60px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}
                  />
                  <span style={{ color: '#666' }}>/ 10</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setShowStudentsList(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSavePoints}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#1976d2',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  };

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
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  return (
    <div className="mobile-container">
      <header className="app-header">
        <h1 className="app-title">спорт <span className="misis-text">МИСИС</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {userData && (
            <>
              <button
                onClick={() => setShowStudentsList(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#2e7d32',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
              >
                <span style={{ fontSize: '16px' }}>🔍</span>
                Поиск студентов
              </button>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: '#1976d2',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>{userData.name}</span>
                  <span style={{ fontSize: '12px', opacity: 0.9, color: '#fff' }}>Преподаватель</span>
                </div>
              </div>
            </>
          )}
          <button className="logout-button" onClick={() => {
            localStorage.removeItem('userType');
            localStorage.removeItem('userData');
            window.location.href = '/login';
          }}>Выйти</button>
        </div>
      </header>

      <div className="navigation-container">
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
          {getNextDays().map((date, index) => (
            <button
              key={date.toISOString()}
              className={`day-button ${date.getTime() === selectedDate.getTime() ? 'selected' : ''} ${index === 0 ? 'today' : ''}`}
              onClick={() => handleDateSelect(date)}
            >
              <span className="date">{getDateString(date)}</span>
              <span className="weekday">{getDayName(date)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nav-content">
        <div className="nav-layout">
          <div className="halls-section" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            {HALLS[selectedLocation].map(hall => (
              <div key={hall.id} className="hall-card">
                <img src={hall.image || '/placeholder-hall.jpg'} alt={hall.name} className="hall-image" />
                <div className="hall-info">
                  <h3 className="hall-title">{hall.name}</h3>
                  <div className="time-slots-wrapper">
                    <div className="time-slots">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          className={`time-slot ${selectedTimeSlots[hall.id] === time ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(hall.id, time)}
                          style={{
                            minWidth: '90px',
                            width: '90px',
                            padding: '8px 4px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: selectedTimeSlots[hall.id] === time ? '#1976d2' : 'white',
                            color: selectedTimeSlots[hall.id] === time ? 'white' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {selectedTimeSlots[hall.id] && (
                      <div className="hall-capacity" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        marginLeft: '10px',
                        opacity: 1,
                        transform: 'translateX(0)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease'
                      }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Занято мест:</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`] ? (
                            <span style={{ 
                              color: hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`].current >= 
                                     hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`].max ? '#d32f2f' :
                                     hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`].current >= 
                                     hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`].max * 0.8 ? '#f57c00' : '#2e7d32'
                            }}>
                              {hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`].current}/
                              {hallCapacities[`${hall.id}_${selectedTimeSlots[hall.id]}`].max}
                            </span>
                          ) : (
                            <span>Загрузка...</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleMarkAttendance(hall)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '15px',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {selectedTimeSlots[hall.id] ? 'Отметить' : 'Выберите время'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showStudentsList && <StudentsList />}

      {notification.show && (
        <div className="notification">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default TeacherView;
