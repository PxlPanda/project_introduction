import React, { useState } from 'react';
import { useFormAndValidation } from '../utils/customHooks/useFormAndValidation.js';
import './Login.css';
import FormInput from './FormInput.js';
import Checkbox from './Checkbox.js';

function Login({ onLogin }) {
  const {
    values,
    handleChange,
    errors,
    isInputValid,
    resetForm,
    isSubmitButtonActive,
    getInputNames,
  } = useFormAndValidation();

  const [teacherLoginChecked, setTeacherLoginChecked] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const loginPlaceHolder = teacherLoginChecked ? 'ФИО' : 'Email';
  const loginPattern = teacherLoginChecked
  ? '^[А-ЯЁа-яё]+\\s[А-ЯЁа-яё]\\.[А-ЯЁа-яё]\\.$'
  : '^[a-zA-Z0-9._%+-]+@edu\.misis\.ru$/';  // Паттерн для email с edu.misis.ru

  const loginTitle = teacherLoginChecked
    ? 'Формат ФИО: Фамилия И.О.'
    : 'example@edu.misis.ru';  // Заголовок с примером email

  const inputElements = [
    {
      id: 1,
      type: 'text',
      name: 'loginInput',
      className: 'login__input',
      required: true,
      pattern: loginPattern,
      title: loginTitle,
      placeholder: loginPlaceHolder,
    },
    {
      id: 2,
      type: 'password',
      name: 'loginPassword',
      className: 'login__input',
      required: true,
      placeholder: 'Пароль',
      minLength: 7,
    },
  ];

  const gatherLoginData = () => ({
    // Если преподаватель, это ФИО, если студент — email
    email: values.loginInput || '',  
    password: values.loginPassword || '',
  });

  const handleSubmit = async (ev, isFirstLogin = false) => {
    ev.preventDefault();
    const loginDetails = gatherLoginData();
    const url = isFirstLogin
      ? '/api/register/teacher/'  // URL для регистрации преподавателя
      : '/api/register/student/';  // URL для регистрации студента

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginDetails),
      });

      const data = await response.json();
      setResponseMessage(data.message || 'Что-то пошло не так');
      setIsSuccess(response.ok);
    } catch {
      setResponseMessage('Ошибка соединения с сервером');
      setIsSuccess(false);
    } finally {
      resetForm();
    }
  };

  return (
    <section className="login">
      <form name="loginForm" className="login__form" noValidate>
        <h2 className="login__title">Вход</h2>
        {inputElements.map((input) => (
          <FormInput
            key={input.id}
            {...input}
            value={values[input.name] || ''}
            isInputValid={isInputValid[input.name]}
            errorMessageText={errors[input.name]}
            onChange={handleChange}
          />
        ))}
        <Checkbox
          label="Войти как преподаватель"
          value={teacherLoginChecked}
          onChange={() => {
            setTeacherLoginChecked(!teacherLoginChecked);
            resetForm();  // Сбросить форму при смене типа входа
          }}
        />
        <span className="login__format-text">{loginTitle}</span>
        <div className="login__button-container">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={!isSubmitButtonActive}
            className={`login__button ${!isSubmitButtonActive && 'login__button_disabled'}`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={!isSubmitButtonActive}
            className={`login__button ${!isSubmitButtonActive && 'login__button_disabled'}`}
          >
            Первый вход
          </button>
        </div>
        {responseMessage && (
          <div className={`response-message ${isSuccess ? 'success' : 'error'}`}>
            {responseMessage}
          </div>
        )}
      </form>
    </section>
  );
}

export default Login;
