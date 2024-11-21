import React, { useEffect, useState } from 'react';
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
  const [responseMessage, setResponseMessage] = useState(null); // Состояние для сообщения
  const [isSuccess, setIsSuccess] = useState(false); // Состояние успеха/ошибки

  const loginData = {
    email: null,
    password: null,
  };

  const loginPlaceHolder = teacherLoginChecked ? 'ФИО' : 'Email';
  const loginPattern = teacherLoginChecked ? '^[А-ЯЁа-яё]+\\s[А-ЯЁа-яё]\\.[А-ЯЁа-яё]\\.$' : '^[a-zA-Z0-9._%+-]+@edu\\.misis\\.ru$'

    ? '^[А-ЯЁа-яё]+\\s[А-ЯЁа-яё]\\.[А-ЯЁа-яё]\\.$'
    : '^[a-zA-Z0-9._%+-]+@edu\\.misis\\.ru$';
  const loginTitle = teacherLoginChecked
    ? 'Формат ФИО: Фамилия И.О.'
    : 'example@edu.misis.ru';

  const handleTeacherLogin = () => {
    setTeacherLoginChecked(!teacherLoginChecked);
    resetForm(); // Очистка формы при смене режима
  };

  const inputElements = [
    {
      id: 1,
      type: 'text',
      name: 'loginInput',
      className: 'login__input login__input_el_login-input',
      required: true,
      minLength: '2',
      maxLength: '40',
      pattern: `${loginPattern}`,
      title: `${loginTitle}`,
      placeholder: `${loginPlaceHolder}`,
    },
    {
      id: 2,
      type: 'password',
      name: 'loginPassword',
      className: 'login__input login__input_el_login-password',
      required: true,
      placeholder: 'Пароль',
      minLength: '7',
    },
  ];

  const clearInputs = () => {
    resetForm();
  };

  const nameInputs = getInputNames(inputElements);

  function gatherLoginData() {
    for (const key in loginData) {
      nameInputs.forEach((el) => {
        if (el.toLowerCase().includes(key.toString())) {
          loginData[key] = values[el];
        }
      });
    }
    return loginData;
  }

  async function handleSubmit(ev, isFirstLogin = false) {
    ev.preventDefault();
    const loginDetails = gatherLoginData();

    try {
      const response = await fetch(
        isFirstLogin ? '/api/register/teacher/' : '/api/register/student/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginDetails),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResponseMessage(data.message);
        setIsSuccess(true); // Успех
      } else {
        setResponseMessage(data.message || 'Что-то пошло не так');
        setIsSuccess(false); // Ошибка
      }
    } catch (error) {
      setResponseMessage('Ошибка соединения с сервером');
      setIsSuccess(false); // Ошибка
    }

    // Оставляем пользователя на текущей странице
    clearInputs();
  }

  return (
    <section className="login">
      <form
        name="loginForm"
        className="login__form"
        noValidate
        onSubmit={(e) => e.preventDefault()} // Предотвращаем редирект формы
      >
        <h2 className="login__title">Вход</h2>
        {inputElements.map((input) => (
          <FormInput
            key={input.id}
            {...input}
            value={values[input.name] || ''}
            inputElement={input}
            isInputValid={isInputValid[input.name]}
            errorMessageText={errors[input.name]}
            onChange={handleChange}
          />
        ))}
        <Checkbox
          label="Войти как преподаватель"
          value={teacherLoginChecked}
          onChange={handleTeacherLogin}
        />
        <span className="login__format-text">{loginTitle}</span>
        <div className="login__button-container">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={!isSubmitButtonActive}
            className={`login__button ${
              isSubmitButtonActive ? '' : 'login__button_disabled'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={!isSubmitButtonActive}
            className={`login__button login__button_secondary ${
              isSubmitButtonActive ? '' : 'login__button_disabled'
            }`}
          >
            Первый вход
          </button>
        </div>
      </form>

      {/* Сообщение об успехе или ошибке */}
      {responseMessage && (
        <div
          className={`response-message ${
            isSuccess ? 'response-message_success' : 'response-message_error'
          }`}
        >
          {responseMessage}
        </div>
      )}
    </section>
  );
}



export default Login;
