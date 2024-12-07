import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { login, registerStudent, registerTeacher } from '../services/api';

const Login = ({ onLogin }) => {
  const [isStudent, setIsStudent] = useState(true);
  const [isRegistration, setIsRegistration] = useState(false);
  const formRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formValue, setFormValue] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    adminPassword: '',
    fullName: '',
    studentNumber: '',
    groupName: ''
  });
  const [isValid, setIsValid] = useState({
    email: true,
    password: true,
    passwordConfirm: true,
    adminPassword: true,
    fullName: true,
    studentNumber: true,
    groupName: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (formRef.current) {
      // Добавляем класс visible ко всем контейнерам с задержкой
      const containers = formRef.current.querySelectorAll('.login__input-container');
      containers.forEach((container, index) => {
        setTimeout(() => {
          container.classList.add('visible');
        }, index * 100);
      });

      // Добавляем класс visible к кнопкам
      const buttons = formRef.current.querySelector('.login__buttons');
      if (buttons) {
        setTimeout(() => {
          buttons.classList.add('visible');
        }, containers.length * 100);
      }
    }
  }, [isStudent, isRegistration]);

  useEffect(() => {
    // Проверяем, есть ли сохраненная сессия
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      onLogin();
      navigate('/main');
    }
  }, []);

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
        // Если пароль изменился, проверяем совпадение с подтверждением
        if (isRegistration) {
          setIsValid(prev => ({
            ...prev,
            passwordConfirm: value === formValue.passwordConfirm
          }));
        }
        break;
      case 'passwordConfirm':
        isFieldValid = value === formValue.password;
        break;
      case 'adminPassword':
        isFieldValid = value.length > 0;
        break;
      case 'fullName':
        const nameRegex = /^[А-ЯЁа-яё]+ [А-ЯЁа-яё]+ [А-ЯЁа-яё]+$/;
        isFieldValid = nameRegex.test(value);
        break;
      case 'studentNumber':
        const studentNumberRegex = /^\d+$/;  // Любое количество цифр
        isFieldValid = studentNumberRegex.test(value);
        break;
      case 'groupName':
        const groupRegex = /^[А-ЯЁа-яё]+-\d+-\d+$/;  // Буквы-цифры-цифры
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Проверяем совпадение паролей при регистрации
    if (isRegistration && formValue.password !== formValue.passwordConfirm) {
      setErrorMessage('Пароли не совпадают');
      return;
    }
  
    try {
      if (isRegistration) {
        const registrationData = isStudent ? {
          email: formValue.email,
          password: formValue.password,
          student_number: formValue.studentNumber,
          group_name: formValue.groupName,
          user_type: 'student'
        } : {
          full_name: formValue.fullName,
          password: formValue.password,
          admin_password: formValue.adminPassword,
          user_type: 'teacher'
        };

        console.log('Отправляемые данные:', registrationData);

        try {
          const registrationResponse = isStudent 
            ? await registerStudent(registrationData)
            : await registerTeacher(registrationData);
          
          const responseData = registrationResponse.data;
          
          // После успешной регистрации автоматически входим
          setIsRegistration(false);
          setFormValue({
            ...formValue,
            passwordConfirm: ''
          });
        } catch (error) {
          throw new Error(error.response?.data?.error || 'Ошибка регистрации');
        }
      }

      // Авторизация - разные данные для студента и преподавателя
      const loginData = isStudent ? {
        email: formValue.email,
        password: formValue.password,
        user_type: 'student'
      } : {
        full_name: formValue.fullName,
        password: formValue.password,
        admin_password: formValue.adminPassword,
        user_type: 'teacher'
      };

      try {
        const response = await login(loginData);
        const loginResponseData = response.data;

        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', loginResponseData.token);
        localStorage.setItem('userType', loginResponseData.user_type);
        
        // Сохраняем данные пользователя
        const userData = {
          type: loginResponseData.user_type,
          name: loginResponseData.full_name,
          email: loginResponseData.email
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));

        // Вызываем колбэк успешного входа
        onLogin();

        // Перенаправляем на главную страницу
        navigate('/');
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMessage(error.message);
    }
  };

  const resetForm = () => {
    setFormValue({
      email: '',
      password: '',
      passwordConfirm: '',
      adminPassword: '',
      fullName: '',
      studentNumber: '',
      groupName: ''
    });
    setIsValid({
      email: true,
      password: true,
      passwordConfirm: true,
      adminPassword: true,
      fullName: true,
      studentNumber: true,
      groupName: true
    });
    setErrorMessage('');
  };

  const toggleUserType = () => {
    const containers = formRef.current.querySelectorAll('.login__input-container');
    const buttons = formRef.current.querySelector('.login__buttons');
    const message = formRef.current.querySelector('.login__message');
    
    containers.forEach(container => container.classList.remove('visible'));
    buttons.classList.remove('visible');
    if (message) message.classList.remove('visible');

    setTimeout(() => {
      setIsStudent(!isStudent);
      resetForm();
    }, 300);
  };

  const toggleRegistration = () => {
    const containers = formRef.current.querySelectorAll('.login__input-container');
    const buttons = formRef.current.querySelector('.login__buttons');
    const message = formRef.current.querySelector('.login__message');
    
    containers.forEach(container => container.classList.remove('visible'));
    buttons.classList.remove('visible');
    if (message) message.classList.remove('visible');

    setTimeout(() => {
      setIsRegistration(!isRegistration);
      resetForm();
    }, 300);
  };

  return (
    <div className="login">
      <div className="login__form-wrapper">
        <form className="login__form" onSubmit={handleSubmit} noValidate ref={formRef}>
          <h2 className="login__title">
            {isRegistration ? (isStudent ? 'Регистрация студента' : 'Регистрация преподавателя') 
                          : (isStudent ? 'Вход для студента' : 'Вход для преподавателя')}
          </h2>
          
          {isStudent ? (
            <>

              <div className="login__input-container">
                <input
                  className={`login__input ${!isValid.email || (errorMessage && errorMessage.includes('email уже зарегистрирован')) ? 'invalid' : ''}`}
                  type="email"
                  name="email"
                  value={formValue.email}
                  onChange={handleChange}
                  placeholder="Email @edu.misis.ru"
                  required
                />
                <span className={`login__input-hint ${errorMessage && errorMessage.includes('email уже зарегистрирован') ? 'error' : ''}`}>
                  {errorMessage && errorMessage.includes('email уже зарегистрирован')
                    ? 'Студент с таким email уже зарегистрирован.'
                    : 'Используйте корпоративную почту @edu.misis.ru'}
                </span>
              </div>

              {/* Добавляем поле для ФИО */}
              {isRegistration && (
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

                  <div className="login__input-container">
                    <input
                      className={`login__input ${!isValid.passwordConfirm ? 'invalid' : ''}`}
                      type="password"
                      name="passwordConfirm"
                      value={formValue.passwordConfirm}
                      onChange={handleChange}
                      placeholder="Подтвердите пароль"
                      required
                    />
                    <span className="login__input-hint">Пароли должны совпадать</span>
                  </div>
                  <div className="login__input-container">
                    <input
                      className={`login__input ${!isValid.studentNumber || (errorMessage && errorMessage.includes('номером студенческого уже зарегистрирован')) ? 'invalid' : ''}`}
                      type="text"
                      name="studentNumber"
                      value={formValue.studentNumber}
                      onChange={handleChange}
                      placeholder="Номер студенческого"
                      required
                    />
                    <span className={`login__input-hint ${errorMessage && errorMessage.includes('номером студенческого уже зарегистрирован') ? 'error' : ''}`}>
                      {errorMessage && errorMessage.includes('номером студенческого уже зарегистрирован')
                        ? 'Студент с таким номером студенческого уже зарегистрирован.'
                        : 'Введите номер студенческого билета (только цифры)'}
                    </span>
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
                    <span className="login__input-hint">Формат: АБВГ-11-22</span>
                  </div>
                </>

              )}
            </>

          ) : (
            <>

              <div className="login__input-container">
                <input
                  className={`login__input ${!isValid.fullName || (errorMessage && errorMessage.includes('ФИО уже зарегистрирован')) ? 'invalid' : ''}`}
                  type="text"
                  name="fullName"
                  value={formValue.fullName}
                  onChange={handleChange}
                  placeholder="ФИО"
                  required
                />
                <span className={`login__input-hint ${errorMessage && errorMessage.includes('ФИО уже зарегистрирован') ? 'error' : ''}`}>
                  {errorMessage && errorMessage.includes('ФИО уже зарегистрирован') 
                    ? 'Преподаватель с таким ФИО уже зарегистрирован. Пожалуйста, войдите в систему или обратитесь к администратору.'
                    : 'Введите полное ФИО (Иванов Иван Иванович)'}
                </span>
              </div>

              {!isRegistration && (
                <div className="login__input-container">
                  <input
                    className={`login__input ${!isValid.adminPassword ? 'invalid' : ''}`}
                    type="password"
                    name="adminPassword"
                    value={formValue.adminPassword}
                    onChange={handleChange}
                    placeholder="Административный пароль"
                    required
                  />
                  <span className="login__input-hint">Введите административный пароль для входа</span>
                </div>
              )}

              <div className="login__input-container">
                <input
                  className={`login__input ${!isValid.password ? 'invalid' : ''}`}
                  type="password"
                  name="password"
                  value={formValue.password}
                  onChange={handleChange}
                  placeholder={isRegistration ? "Придумайте пароль" : "Личный пароль"}
                  required
                />
                <span className="login__input-hint">
                  {isRegistration ? "Минимум 6 символов" : "Введите свой пароль"}
                </span>
              </div>

              {isRegistration && (
                <div className="login__input-container">
                  <input
                    className={`login__input ${!isValid.passwordConfirm ? 'invalid' : ''}`}
                    type="password"
                    name="passwordConfirm"
                    value={formValue.passwordConfirm}
                    onChange={handleChange}
                    placeholder="Подтвердите пароль"
                    required
                  />
                  <span className="login__input-hint">Пароли должны совпадать</span>
                </div>
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
        </form>
      </div>
    </div>
  );
}

export default Login;