import React, { useEffect, useState } from 'react';
import StudentView from './student/StudentView';
import TeacherView from './teacher/TeacherView';
import './styles/base.css';

const Main = () => {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const savedUserType = localStorage.getItem('userType');
    if (!savedUserType) {
      window.location.href = '/login';
      return;
    }
    setUserType(savedUserType);
  }, []);

  if (!userType) {
    return null;
  }

  return userType === 'student' ? <StudentView /> : <TeacherView />;
};

export default Main;