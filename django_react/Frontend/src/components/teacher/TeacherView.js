import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HALLS } from '../constants/halls';
import { timeSlots } from '../constants/timeSlots';
import '../styles/base.css';
import '../styles/navigation.css';
import '../styles/hall-card.css';
import '../styles/buttons.css';
import '../styles/header.css';
import '../styles/calendar.css';
import axios from 'axios';

const SearchInput = React.memo(({ value, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <input
      type="text"
      placeholder="Поиск по ФИО"
      value={value}
      onChange={handleChange}
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

const AUTO_DELETE_DELAY = 25 * 60 * 1000; // 25 минут в миллисекундах
const StudentsList = React.memo(({ 
  searchName, 
  setSearchName, 
  searchGroup, 
  setSearchGroup,
  originalStudents,
  studentsForTimeSlot,
  setShowStudentsList,
  selectedStudents,
  setSelectedStudents,
  maxPoints,
  setMaxPoints,
  handleSavePoints,
  timeSlot,
  canDelete,
}) => {
  const uniqueGroups = [...new Set(originalStudents.map(student => student.group))];
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [tempPoints, setTempPoints] = useState(maxPoints);
  
  useEffect(() => {
    if (!timeSlot || !studentsForTimeSlot.length || !canDelete) return;
  
    const lectureStartTime = new Date(timeSlot.start_time);
    const now = new Date();
    const timeSinceStart = now - lectureStartTime;
    
    if (timeSinceStart >= 0 && timeSinceStart < AUTO_DELETE_DELAY) {
      const timeoutId = setTimeout(async () => {
        // Получаем список неотмеченных студентов
        const unmarkedStudents = studentsForTimeSlot.filter(
          student => !selectedStudents.has(student.id)
        );
  
        // Удаляем каждого неотмеченного студента
        for (const student of unmarkedStudents) {
          try {
            await axios.delete(`/api/bookings/${student.id}/`);
            console.log(`Автоматически удалена запись студента ${student.name}`);
          } catch (error) {
            console.error(`Ошибка при удалении записи студента ${student.id}:`, error);
          }
        }
  
        // Обновляем список студентов
        window.location.reload(); // Перезагружаем страницу для обновления данных
  
      }, AUTO_DELETE_DELAY - timeSinceStart);
  
      return () => clearTimeout(timeoutId);
    }
  }, [timeSlot, studentsForTimeSlot, selectedStudents, canDelete]);

  const getRemainingTime = () => {
    if (!timeSlot) return '';
    
    const lectureStartTime = new Date(timeSlot.start_time);
    const now = new Date();
    const timeSinceStart = now - lectureStartTime;
    
    if (timeSinceStart < 0) {
      return 'Пара еще не началась';
    }
    
    if (timeSinceStart >= AUTO_DELETE_DELAY) {
      return 'Время автоудаления истекло';
    }
    
    const remainingTime = Math.ceil((AUTO_DELETE_DELAY - timeSinceStart) / 60000); // в минутах
    return `До автоудаления: ${remainingTime} мин`;
  };

  const handlePointsEdit = () => {
    setIsEditingPoints(true);
    setTempPoints(maxPoints);
  };

  const handlePointsSave = () => {
    const points = Math.max(1, Math.min(100, parseInt(tempPoints) || 1));
    setMaxPoints(points);
    setTempPoints(points);
    setIsEditingPoints(false);
  };

  const handlePointsKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePointsSave();
    } else if (e.key === 'Escape') {
      setIsEditingPoints(false);
      setTempPoints(maxPoints);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Отметить посещаемость</h2>
          <div className="auto-delete-timer">
            {getRemainingTime()}
          </div>
          <button 
            className="close-button"
            onClick={() => setShowStudentsList(false)}
          >
            ✕
          </button>
        </div>
        <div className="students-list-container">
          <div className="search-filters">
            <div className="search-group">
              <SearchInput value={searchName} onChange={setSearchName} />
              <select
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="group-select"
              >
                <option value="">Все группы</option>
                {uniqueGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="points-container" onClick={handlePointsEdit}>
              <div className="points-label">Баллы за занятие:</div>
              {isEditingPoints ? (
                <input
                  type="number"
                  className="points-input"
                  value={tempPoints}
                  onChange={(e) => setTempPoints(e.target.value)}
                  onBlur={handlePointsSave}
                  onKeyDown={handlePointsKeyDown}
                  min="1"
                  max="100"
                  autoFocus
                />
              ) : (
                <div className="points-value" title="Нажмите для редактирования">
                  {maxPoints}
                </div>
              )}
            </div>
          </div>

          <div className="students-table">
            <div className="table-header">
              <div className="header-cell">ФИО</div>
              <div className="header-cell">Группа</div>
              <div className="header-cell">Статус</div>
            </div>
            {studentsForTimeSlot.map(student => (
              <div key={student.id} className="table-row">
                <div className="table-cell">{student.name}</div>
                <div className="table-cell">{student.group}</div>
                <div className="table-cell">
                  <label className="attendance-checkbox">
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
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button 
              className="cancel-button"
              onClick={() => setShowStudentsList(false)}
            >
              Отмена
            </button>
            <button 
              className="save-button"
              onClick={handleSavePoints}
              disabled={selectedStudents.size === 0}
            >
              Сохранить посещаемость
            </button>
          </div>
        </div>
      </div>
    </div>
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
  const searchInputRef = useRef(null);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [canDelete, setCanDelete] = useState(false);

  const checkCanDelete = useCallback(() => {
    if (!selectedTimeSlot) {
      setCanDelete(false);
      return;
    }

    const now = new Date();
    const lectureTime = new Date(selectedTimeSlot.start_time);
    const timeDiff = now - lectureTime;
    
    // Разрешаем удаление за 30 минут до начала пары и до истечения AUTO_DELETE_DELAY
    const canDeleteNow = timeDiff >= -30 * 60 * 1000 && timeDiff < AUTO_DELETE_DELAY;
    setCanDelete(canDeleteNow);
  }, [selectedTimeSlot]);

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
      setOriginalStudents(data);
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
    setSelectedTimeSlot(selectedTime);
    fetchStudents(hall, selectedTime);
  };

  useEffect(() => {
    checkCanDelete();
    const interval = setInterval(checkCanDelete, 60000);
    return () => clearInterval(interval);
  }, [checkCanDelete]);


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
    if (!showStudentsList) {
      setSearchName('');
      setSearchGroup('');
      setStudentsForTimeSlot(originalStudents);
    }
  }, [showStudentsList]);

  const handleSearch = () => {
    const filtered = originalStudents.filter(student => {
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

  const handleSavePointsClick = async () => {
    try {
      setIsLoading(true);
      
      const selectedStudentIds = Array.from(selectedStudents);
  
      if (selectedStudentIds.length === 0) {
        alert('Не выбраны студенты для начисления баллов');
        return;
      }
      
      console.log('selectedTimeSlot:', selectedTimeSlot);
  
      if (!selectedTimeSlot) {
        alert('Не выбрано время занятия');
        return;
      }
  
      const studentsToUpdate = selectedStudentIds.map(studentId => ({
        student_id: parseInt(studentId),
        points: maxPoints,
        reason: 'Посещение занятия'
      }));
  
      const response = await fetch('/api/save-points/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students_points: studentsToUpdate,
          time_slot_id: selectedTimeSlot.id
        })
      });
  
      if (!response.ok) {
        throw new Error('Ошибка сохранения баллов');
      }
  
      const data = await response.json();
      if (data.updated_students) {
        const updatedStudentsMap = new Map(data.updated_students.map(s => [s.student_id, s]));
        setStudentsForTimeSlot(prevStudents => 
          prevStudents.map(student => ({
            ...student,
            points: updatedStudentsMap.get(student.id)?.points || student.points
          }))
        );
        
        // Добавляем отправку события после успешного обновления
        window.dispatchEvent(new CustomEvent('student-points-updated', {
          detail: {
            updatedStudents: data.updated_students
          }
        }));
      }
  
      alert('Баллы успешно сохранены');
      setShowStudentsList(false);
    } catch (error) {
      console.error('Error saving points:', error);
      alert(error.message || 'Произошла ошибка при сохранении баллов');
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

  const styles = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      color: #1565c0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #424242;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: #f5f5f5;
      color: #1976d2;
    }

    .students-list-container {
      padding: 20px;
      overflow-y: auto;
      color: #212121;
    }

    .search-filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 20px;
    }

    .search-group {
      display: flex;
      gap: 10px;
      flex: 1;
    }

    .group-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      min-width: 150px;
      color: #424242;
      background-color: white;
    }

    .points-container {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #e3f2fd;
      padding: 8px 16px;
      border-radius: 4px;
      border: 1px solid #90caf9;
      cursor: pointer;
      transition: all 0.2s;
    }

    .points-container:hover {
      background: #bbdefb;
      border-color: #64b5f6;
    }

    .points-label {
      color: #1565c0;
      font-weight: 500;
    }

    .points-value {
      font-size: 18px;
      font-weight: bold;
      color: #1565c0;
      min-width: 30px;
      text-align: center;
    }

    .points-input {
      font-size: 18px;
      font-weight: bold;
      color: #1565c0;
      width: 60px;
      text-align: center;
      padding: 4px 8px;
      border: 2px solid #1976d2;
      border-radius: 4px;
      background: white;
    }

    .points-input:focus {
      outline: none;
      border-color: #1565c0;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .students-table {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 100px;
      background: #f5f5f5;
      padding: 12px;
      font-weight: 600;
      color: #1565c0;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 100px;
      padding: 12px;
      border-top: 1px solid #ddd;
      align-items: center;
      color: #424242;
    }

    .table-row:hover {
      background: #f8f8f8;
    }

    .attendance-checkbox {
      display: block;
      position: relative;
      cursor: pointer;
      font-size: 16px;
      user-select: none;
      width: 24px;
      height: 24px;
    }

    .attendance-checkbox input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 24px;
      width: 24px;
      background-color: #fff;
      border: 2px solid #1976d2;
      border-radius: 4px;
    }

    .attendance-checkbox:hover input ~ .checkmark {
      background-color: #e3f2fd;
    }

    .attendance-checkbox input:checked ~ .checkmark {
      background-color: #1976d2;
    }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }

    .attendance-checkbox input:checked ~ .checkmark:after {
      display: block;
      left: 7px;
      top: 3px;
      width: 6px;
      height: 12px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .action-buttons {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .save-button, .cancel-button {
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .save-button {
      background: #1976d2;
      color: white;
      border: none;
    }

    .save-button:hover {
      background: #1565c0;
    }

    .save-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .cancel-button {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .cancel-button:hover {
      background: #f5f5f5;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

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
                      {timeSlots[selectedLocation.toLowerCase()].map(time => (
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
      {showStudentsList && (
        <StudentsList
          searchName={searchName}
          setSearchName={setSearchName}
          searchGroup={searchGroup}
          setSearchGroup={setSearchGroup}
          originalStudents={originalStudents}
          studentsForTimeSlot={studentsForTimeSlot}
          setShowStudentsList={setShowStudentsList}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          maxPoints={maxPoints}
          setMaxPoints={setMaxPoints}
          handleSavePoints={handleSavePointsClick}
          timeSlot={selectedTimeSlot}
          canDelete={canDelete}
        />
      )}
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
