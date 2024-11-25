import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [isStudent, setIsStudent] = useState(true);
  const [isRegistration, setIsRegistration] = useState(false);
  const formRef = useRef(null);
  const [formValue, setFormValue] = useState({
    email: '',
    password: '',
    fullName: '',
    studentNumber: '',
    groupName: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState({
    email: true,
    password: true,
    fullName: true,
    studentNumber: true,
    groupName: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Добавляем класс visible ко всем контейнерам с задержкой
    const containers = formRef.current.querySelectorAll('.login__input-container');
    containers.forEach((container, index) => {
      setTimeout(() => {
        container.classList.add('visible');
      }, index * 100);
    });

    // Добавляем класс visible к кнопкам
    const buttons = formRef.current.querySelector('.login__buttons');
    setTimeout(() => {
      buttons.classList.add('visible');
    }, containers.length * 100);
  }, [isStudent, isRegistration]);

  useEffect(() => {
    // Проверяем, есть ли сохраненная сессия
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      onLogin();
      navigate('/main');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Форматируем ФИО при вводе
    if (name === 'fullName') {
      // Разбиваем строку на слова
      const words = value.split(' ');
      // Форматируем каждое слово с заглавной буквы
      const formattedWords = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
      // Объединяем обратно
      const formattedValue = formattedWords.join(' ');
      
      setFormValue(prevState => ({
        ...prevState,
        [name]: formattedValue
      }));
    } else {
      setFormValue(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

    validateField(name, value);
  }

  const validateField = (name, value) => {
    let isFieldValid = true;
    
    switch (name) {
      case 'email':
        if (isStudent) {
          const emailRegex = /^[^\s@]+@edu\.misis\.ru$/;
          isFieldValid = emailRegex.test(value);
        }
        break;
      case 'password':
        isFieldValid = value.length >= 6;
        break;
      case 'fullName':
        // Проверяем только наличие трех слов и отсутствие цифр/спецсимволов
        const nameRegex = /^[А-ЯЁа-яё]+ [А-ЯЁа-яё]+ [А-ЯЁа-яё]+$/;
        isFieldValid = nameRegex.test(value);
        break;
      case 'studentNumber':
        const studentNumberRegex = /^[A-ZА-Я]\d{8}$/;
        isFieldValid = studentNumberRegex.test(value);
        break;
      case 'groupName':
        const groupRegex = /^[А-ЯЁ]{4}-\d{2}-\d{2}$/;
        isFieldValid = groupRegex.test(value);
        break;
      default:
        break;
    }

    setIsValid(prevState => ({
      ...prevState,
      [name]: isFieldValid
    }));

    return isFieldValid;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const username = isStudent ? formValue.email : formValue.fullName;
    const password = formValue.password;

    if (!username || !password) {
      const message = formRef.current.querySelector('.login__message');
      message.classList.add('visible');
      setErrorMessage('Пожалуйста, корректно заполните все поля');
      return;
    }

    // Здесь будет запрос к API для аутентификации
    // Пока используем моковые данные
    const userData = {
      username: username,
      isStudent: isStudent,
      token: 'mock-token-' + Date.now(),
      fullName: isStudent ? 'Студент Тестовый' : username,
      studentId: isStudent ? 'A12345678' : null,
      group: isStudent ? 'АБВГ-00-00' : null
    };

    // Сохраняем данные пользователя
    localStorage.setItem('userData', JSON.stringify(userData));
    
    onLogin();
    navigate('/main');
  }

  const toggleUserType = () => {
    // Сначала скрываем все элементы
    const containers = formRef.current.querySelectorAll('.login__input-container');
    const buttons = formRef.current.querySelector('.login__buttons');
    const message = formRef.current.querySelector('.login__message');
    
    containers.forEach(container => container.classList.remove('visible'));
    buttons.classList.remove('visible');
    if (message) message.classList.remove('visible');

    // После анимации исчезновения меняем состояние
    setTimeout(() => {
      setIsStudent(!isStudent);
      setErrorMessage('');
      setFormValue({
        email: '',
        password: '',
        fullName: '',
        studentNumber: '',
        groupName: ''
      });
      setIsValid({
        email: true,
        password: true,
        fullName: true,
        studentNumber: true,
        groupName: true
      });
    }, 300);
  }

  const toggleRegistration = () => {
    // Сначала скрываем все элементы
    const containers = formRef.current.querySelectorAll('.login__input-container');
    const buttons = formRef.current.querySelector('.login__buttons');
    const message = formRef.current.querySelector('.login__message');
    
    containers.forEach(container => container.classList.remove('visible'));
    buttons.classList.remove('visible');
    if (message) message.classList.remove('visible');

    // После анимации исчезновения меняем состояние
    setTimeout(() => {
      setIsRegistration(!isRegistration);
      setErrorMessage('');
      setFormValue({
        email: '',
        password: '',
        fullName: '',
        studentNumber: '',
        groupName: ''
      });
      setIsValid({
        email: true,
        password: true,
        fullName: true,
        studentNumber: true,
        groupName: true
      });
    }, 300);
  }

  return (
    <div className="login">
      <div className="login__form-wrapper">
        <form className="login__form" onSubmit={handleSubmit} noValidate ref={formRef}>
          <h2 className="login__title">
            {isRegistration ? (isStudent ? 'Регистрация студента' : 'Регистрация преподавателя') 
                          : (isStudent ? 'Вход для студента' : 'Вход для преподавателя')}
          </h2>
          
          {isStudent ? (
            <div className="login__input-container">
              <input
                className={`login__input ${!isValid.email ? 'invalid' : ''}`}
                type="email"
                name="email"
                value={formValue.email}
                onChange={handleChange}
                placeholder="Email @edu.misis.ru"
                required
              />
              <span className="login__input-hint">Используйте корпоративную почту @edu.misis.ru</span>
            </div>
          ) : (
            <div className="login__input-container">
              <input
                className={`login__input ${!isValid.fullName ? 'invalid' : ''}`}
                type="text"
                name="fullName"
                value={formValue.fullName}
                onChange={handleChange}
                placeholder="ФИО"
                required
              />
              <span className="login__input-hint">Введите полное ФИО (Иванов Иван Иванович)</span>
            </div>
          )}

          <div className="login__input-container">
            <input
              className={`login__input ${!isValid.password ? 'invalid' : ''}`}
              type="password"
              name="password"
              value={formValue.password}
              onChange={handleChange}
              placeholder="Пароль"
              required
            />
            <span className="login__input-hint">Минимум 6 символов</span>
          </div>

          {isRegistration && (
            <>
              {isStudent && isRegistration && (
                <div className="login__input-container">
                  <input
                    className={`login__input ${!isValid.fullName ? 'invalid' : ''}`}
                    type="text"
                    name="fullName"
                    value={formValue.fullName}
                    onChange={handleChange}
                    placeholder="ФИО"
                    required
                  />
                  <span className="login__input-hint">Введите полное ФИО (Иванов Иван Иванович)</span>
                </div>
              )}

              {isStudent && (
                <>
                  <div className="login__input-container">
                    <input
                      className={`login__input ${!isValid.studentNumber ? 'invalid' : ''}`}
                      type="text"
                      name="studentNumber"
                      value={formValue.studentNumber}
                      onChange={handleChange}
                      placeholder="Номер студенческого"
                      required
                    />
                    <span className="login__input-hint">Формат: А12345678</span>
                  </div>

                  <div className="login__input-container">
                    <input
                      className={`login__input ${!isValid.groupName ? 'invalid' : ''}`}
                      type="text"
                      name="groupName"
                      value={formValue.groupName}
                      onChange={handleChange}
                      placeholder="Группа"
                      required
                    />
                    <span className="login__input-hint">Формат: АБВГ-00-00</span>
                  </div>
                </>
              )}
            </>
          )}

          <div className="login__buttons">
            <button
              className="login__button login__button_submit"
              type="submit"
              disabled={Object.values(isValid).some(valid => !valid)}
            >
              {isRegistration ? 'Зарегистрироваться' : 'Войти'}
            </button>
            <button
              className="login__button login__button_switch"
              type="button"
              onClick={toggleUserType}
            >
              {isStudent ? 'Войти как преподаватель' : 'Войти как студент'}
            </button>
            <button
              className="login__button login__button_switch"
              type="button"
              onClick={toggleRegistration}
            >
              {isRegistration ? 'Уже есть аккаунт? Войти' : 'Создать аккаунт'}
            </button>
          </div>

          {errorMessage && (
            <div className="login__message login__message_error">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
