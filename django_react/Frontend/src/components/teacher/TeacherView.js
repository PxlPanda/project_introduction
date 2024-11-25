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
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [studentsForTimeSlot, setStudentsForTimeSlot] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (!savedUserData) {
      window.location.href = '/login';
      return;
    }
    setUserData(JSON.parse(savedUserData));
  }, []);

  const handleMarkAttendance = (hall) => {
    setShowStudentsList(true);
    setStudentsForTimeSlot([
      { id: 1, name: 'Иванов Иван', group: 'БПМ-20-1', present: false },
      { id: 2, name: 'Петров Петр', group: 'БПМ-20-2', present: false },
      { id: 3, name: 'Сидоров Сидор', group: 'БПМ-20-1', present: false },
    ]);
  };

  const StudentsList = () => {
    const uniqueGroups = [...new Set(studentsForTimeSlot.map(student => student.group))];
    
    const filteredStudents = studentsForTimeSlot.filter(student => 
      student.name.toLowerCase().includes(searchName.toLowerCase()) &&
      (searchGroup === '' || student.group === searchGroup)
    );

    return (
      <div className="students-list-modal">
        <div className="students-list-content">
          <h2>Список студентов</h2>
          
          <div className="search-controls">
            <input
              type="text"
              placeholder="Поиск по ФИО"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="search-input"
              autoComplete="off"
            />
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

          <div className="students-table">
            {filteredStudents.map(student => (
              <div key={student.id} className="student-row">
                <div className="student-info">
                  <span className="student-name">{student.name}</span>
                  <span className="student-group">{student.group}</span>
                </div>
                <button 
                  className={`presence-button ${student.present ? 'present' : ''}`}
                  onClick={() => {
                    setStudentsForTimeSlot(students =>
                      students.map(s =>
                        s.id === student.id ? { ...s, present: !s.present } : s
                      )
                    );
                  }}
                >
                  Присутствует
                </button>
              </div>
            ))}
          </div>

          <div className="modal-buttons">
            <button onClick={() => setShowStudentsList(false)}>Закрыть</button>
            <button onClick={() => {
              setShowStudentsList(false);
              showNotification('Посещаемость сохранена');
            }}>Сохранить</button>
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
        <button className="logout-button" onClick={() => {
          localStorage.removeItem('userType');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }}>Выйти</button>
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
          <div className="nav-main">
            {HALLS[selectedLocation].map(hall => (
              <div key={hall.id} className="hall-card">
                <div className="hall-info">
                  <h3 className="hall-title">{hall.name}</h3>
                  <div className="hall-capacity">
                    Занято: {hall.currentCapacity}/{hall.capacity}
                  </div>
                  <button
                    className="attendance-button"
                    onClick={() => handleMarkAttendance(hall)}
                  >
                    Отметить посещаемость
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
