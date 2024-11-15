import React, { useEffect, useState } from 'react';
import { useFormAndValidation } from '../utils/customHooks/useFormAndValidation.js';
import './Login.css';
import FormInput from './FormInput.js';
import Checkbox from './Checkbox.js';

function Login({ onLogin }) {

const {values, handleChange, errors, isInputValid, resetForm, isSubmitButtonActive, getInputNames} = useFormAndValidation();

const [teacherLoginChecked, setTeacherLoginChecked] = useState(false);
const [teacherName, setTeacherName] = useState(false);
const loginData = {
  email: null,
  password: null
}
let loginPlaceHolder = teacherName? 'Email' : 'ФИО';
let loginPattern = teacherName? "[a-zA-Z0-9]+@edu.misis.ru" : "[a-zA-Z ]";
let loginTitle = teacherName? 'login@edu.misis.ru' : 'Фамилия И.О';

const handleTeacherLogin = () => {
  setTeacherLoginChecked(!teacherLoginChecked);
  // some actions here
  
};

  const inputElements = [
    {
      id: 1,
      type: "text",
      name: "loginEmail",
      className: "login__input login__input_el_login-Email",
      required: true,
      minLength: "2",
      maxLength: "40",
      pattern: `${loginPattern}`,
      title: `${loginTitle}`,
      placeholder: `${loginPlaceHolder}`
    },
    {
      id: 2,
      type: "password",
      name: "loginPassword",
      className: "login__input login__input_el_login-password",
      required: true,
      placeholder: "Пароль",
      minLength: "7"
    }
  ]

  const clearInputs = () => {
    resetForm();
  }

  const nameInputs = getInputNames(inputElements);

  // функция, формирующая данные для последующего обращения с ними на сервер
  function gatherLoginData() {
    for (const key in loginData) {
      nameInputs.forEach((el) => {
        if (el.toLowerCase().includes(key.toString())) {
          loginData[key] = values[el];
        }
      })
    }
    return loginData;
  }

  //функция submit формы (обновление пользовательских данных на сервере)
  function handleSubmit(ev) {
    ev.preventDefault();
    onLogin();
    clearInputs();
  }

  useEffect(() => {
    setTeacherName(!teacherName);
    const loginData = gatherLoginData();
    for (const key in loginData) {
      if (loginData[key]) {
        if (loginData[key].length !== 0) {
          clearInputs();
          break;
        }
      }  
    }
  }, [teacherLoginChecked]);

  return (
    <section className="login">
      <form onSubmit={handleSubmit} name="loginForm" className="login__form" noValidate>
      <h2 className="login__title">Вход</h2>
        {
          inputElements.map((input) => (
            <FormInput key={input.id}
              {...input}
              value={values[input.name] || ""}
              inputElement={input}
              isInputValid={isInputValid[input.name]}
              errorMessageText={errors[input.name]}
              onChange={handleChange} />
          ))
        }
        <Checkbox
          label="Войти как преподаватель"
          value={teacherLoginChecked}
          onChange={handleTeacherLogin}
        />
        <span className={`login__teacher-login-textformat ${!teacherName && 'login__teacher-login-textformat_active'}`}>Формат ФИО: Фамилия И.О.</span>
        <button type="submit" disabled={!isSubmitButtonActive} className={`login__button ${isSubmitButtonActive ? '' : 'login__button_disabled'}`}>Войти</button>
      </form>
    </section>
  );
}

export default Login;
