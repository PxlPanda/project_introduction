import React, { useState, useEffect, useRef } from 'react';
import { HALLS } from '../constants/halls';
import { timeSlots } from '../constants/timeSlots';
import '../styles/base.css';
import '../styles/navigation.css';
import '../styles/hall-card.css';
import '../styles/buttons.css';
import '../styles/header.css';
import '../styles/calendar.css';

const SearchInput = React.memo(({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Поиск по ФИО"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
      }}
    />
  );
});

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
  const [maxPoints, setMaxPoints] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Состояния для модального окна начисления баллов
  const [showAwardPointsModal, setShowAwardPointsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pointsToAward, setPointsToAward] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [awardingPoints, setAwardingPoints] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  const fetchStudents = async (hall, timeSlot) => {
    try {
      setIsLoading(true);
      
      // Учитываем часовой пояс при форматировании даты
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      // Преобразуем время в формат HH:MM
      const formattedTime = timeSlot.split('-')[0].trim();
      
      console.log('Selected date object:', selectedDate);
      console.log('Fetching students with params:', {
        date,
        timeSlot: formattedTime,
        hallName: hall.name,
        fullTimeSlot: timeSlot
      });

      const response = await fetch(`/api/booked-students/?date=${date}&timeSlot=${formattedTime}&hallId=${encodeURIComponent(hall.name)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки списка студентов');
      }
      
      const data = await response.json();
      console.log('Received students:', data);
      setStudentsForTimeSlot(data);
      setShowStudentsList(true);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert(error.message || 'Не удалось загрузить список студентов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = (hall) => {
    const selectedTime = selectedTimeSlots[hall.id];
    if (!selectedTime) {
      showNotification('Выберите время пары');
      return;
    }
    console.log('Marking attendance for:', {
      hall,
      selectedTime
    });
    fetchStudents(hall, selectedTime);
  };

  useEffect(() => {
    if (showStudentsList) {
      // fetchStudents();
    }
  }, [showStudentsList]);

  const getSortedStudents = () => {
    return [...studentsForTimeSlot].sort((a, b) => {
      if (selectedStudents.has(a.id) && !selectedStudents.has(b.id)) return -1;
      if (!selectedStudents.has(a.id) && selectedStudents.has(b.id)) return 1;
      return 0;
    });
  };

    // Функция для начисления баллов
    const handleAwardPoints = async () => {
      if (!selectedStudent || !pointsToAward || !pointsReason) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
  
      try {
        setAwardingPoints(true);
        const response = await fetch('/api/award-points/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: selectedStudent.id,
            points: parseInt(pointsToAward),
            reason: pointsReason
          })
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при начислении баллов');
        }
  
        const data = await response.json();
        alert('Баллы успешно начислены');
        
        // Очищаем форму
        setPointsToAward('');
        setPointsReason('');
        setShowAwardPointsModal(false);
        
      } catch (error) {
        console.error('Error awarding points:', error);
        alert('Произошла ошибка при начислении баллов');
      } finally {
        setAwardingPoints(false);
      }
    };


  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (!savedUserData) {
      window.location.href = '/login';
      return;
    }
    setUserData(JSON.parse(savedUserData));
  }, []);

  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchName, isSearchFocused]);

  const handleSearch = () => {
    const filtered = studentsForTimeSlot.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchName.toLowerCase());
      const groupMatch = !searchGroup || student.group === searchGroup;
      return nameMatch && groupMatch;
    });
    setStudentsForTimeSlot(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchName, searchGroup]);

  const handlePointsChange = (studentId, points) => {
    const limitedPoints = Math.min(points, maxPoints);
    setSelectedPoints(prev => ({
      ...prev,
      [studentId]: limitedPoints
    }));
  };

  const handleReasonChange = (studentId, reason) => {
    setPointsReasons(prev => ({
      ...prev,
      [studentId]: reason
    }));
  };

  const handleSavePoints = async () => {
    try {
      setIsLoading(true);
      const studentsToUpdate = Object.entries(selectedPoints).map(([studentId, points]) => ({
        student_id: parseInt(studentId),
        points: points,
        reason: pointsReasons[studentId] || ''
      })).filter(item => item.points > 0 && item.reason);
  
      if (studentsToUpdate.length === 0) {
        alert('Нет баллов для сохранения');
        return;
      }
  
      const response = await fetch('/api/save-points/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students_points: studentsToUpdate
        })
      });
  
      if (!response.ok) {
        throw new Error('Ошибка сохранения баллов');
      }
  
      alert('Баллы успешно сохранены');
      setSelectedPoints({});
      setPointsReasons({});
      setShowStudentsList(false);
      
    } catch (error) {
      console.error('Error saving points:', error);
      alert('Не удалось сохранить баллы');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHallCapacity = async (hallId, time) => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      const formattedTime = time.split('-')[0].trim();
      
      // Получаем имя зала из HALLS
      const hall = HALLS[selectedLocation].find(h => h.id === hallId);
      if (!hall) {
        throw new Error('Зал не найден');
      }
      
      const response = await fetch(`/api/hall-capacity/?date=${date}&timeSlot=${formattedTime}&hallId=${encodeURIComponent(hall.name)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка получения данных о заполненности зала');
      }
      
      const data = await response.json();
      return {
        current: data.current_capacity || 0,
        max: data.max_capacity || 30
      };
    } catch (error) {
      console.error('Error fetching hall capacity:', error);
      return { current: 0, max: 30 };
    }
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
    const uniqueGroups = [...new Set(studentsForTimeSlot.map(student => student.group))];
    
    const filteredStudents = studentsForTimeSlot.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchName.toLowerCase());
      const groupMatch = !searchGroup || student.group === searchGroup;
      return nameMatch && groupMatch;
    });
    
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
          <SearchInput 
            value={searchName}
            onChange={setSearchName}
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
            {getSortedStudents().map((student, index) => (
              <div key={student.id} style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                backgroundColor: selectedStudents.has(student.id) ? '#f5f5f5' : 'white'
              }}>
                <div style={{ flex: 0.5 }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedStudents);
                      if (e.target.checked) {
                        newSelected.add(student.id);
                      } else {
                        newSelected.delete(student.id);
                      }
                      setSelectedStudents(newSelected);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{student.group}</div>
                </div>
                <div style={{ flex: 2 }}>
                  <input
                    type="text"
                    placeholder="Причина начисления баллов"
                    value={pointsReasons[student.id] || ''}
                    onChange={(e) => {
                      handleReasonChange(student.id, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const pointsInput = document.querySelector(`#points-${student.id}`);
                        if (pointsInput) pointsInput.focus();
                      }
                      if (e.key === 'ArrowDown' && index < studentsForTimeSlot.length - 1) {
                        const nextInput = document.querySelector(`#reason-${studentsForTimeSlot[index + 1].id}`);
                        if (nextInput) nextInput.focus();
                      }
                      if (e.key === 'ArrowUp' && index > 0) {
                        const prevInput = document.querySelector(`#reason-${studentsForTimeSlot[index - 1].id}`);
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    id={`reason-${student.id}`}
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
                    max={maxPoints}
                    value={selectedPoints[student.id] || 0}
                    onChange={(e) => handlePointsChange(student.id, parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'ArrowDown') {
                        if (index < studentsForTimeSlot.length - 1) {
                          const nextReasonInput = document.querySelector(`#reason-${studentsForTimeSlot[index + 1].id}`);
                          if (nextReasonInput) nextReasonInput.focus();
                        }
                      }
                      if (e.key === 'ArrowUp' && index > 0) {
                        const prevReasonInput = document.querySelector(`#reason-${studentsForTimeSlot[index - 1].id}`);
                        if (prevReasonInput) prevReasonInput.focus();
                      }
                    }}
                    id={`points-${student.id}`}
                    style={{
                      width: '60px',
                      padding: '8px',
                      border: selectedPoints[student.id] ? '2px solid #1976d2' : '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'center',
                      backgroundColor: selectedPoints[student.id] ? '#e3f2fd' : 'white'
                    }}
                  />
                  <span style={{ color: '#666' }}>/ </span>
                  {student.id === studentsForTimeSlot[0]?.id ? (
                    <input
                      type="number"
                      min="1"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(parseInt(e.target.value) || 1)}
                      style={{
                        width: '60px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    />
                  ) : (
                    <span style={{ color: '#666' }}>{maxPoints}</span>
                  )}
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
            onClick={() => setSelectedLocation('gorny')}
          >
            Горный
          </button>
          <button
            className={`location-button ${selectedLocation === 'belyaevo' ? 'active' : ''}`}
            onClick={() => setSelectedLocation('belyaevo')}
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
              <span className="day">{getDayName(date)}</span>
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
      {showAwardPointsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Начисление баллов</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>Студент:</label>
                <div>{selectedStudent?.user?.full_name}</div>
              </div>
              <div className="form-group">
                <label>Количество баллов:</label>
                <input
                  type="number"
                  value={pointsToAward}
                  onChange={(e) => setPointsToAward(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Причина начисления:</label>
                <textarea
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowAwardPointsModal(false)}
                disabled={awardingPoints}
              >
                Отмена
              </button>
              <button 
                onClick={handleAwardPoints}
                disabled={awardingPoints || !pointsToAward || !pointsReason}
                className="primary"
              >
                {awardingPoints ? 'Начисление...' : 'Начислить баллы'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherView;
