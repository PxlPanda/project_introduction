import React from 'react';
import './FormInput.css';

function FormInput({
  type,
  name,
  className,
  required,
  minLength,
  maxLength,
  placeholder,
  value,
  onChange,
  inputElement,
  isInputValid,
  errorMessageText,
  pattern,
  title,
}) {

  function handleCheckValidity(ev) {
    onChange(ev, inputElement);
  }

  return (
    <>
      <input
        type={type}
        name={name}
        className={typeof isInputValid === "undefined"? `${className}` : isInputValid? `${className}` : `input_type_error ${className}`}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={handleCheckValidity}
        pattern={pattern? `${pattern}` : undefined}
        title={title? `${title}` : ''}
      />
      <span className={`login__error ${name}-error`}>{errorMessageText}</span>
    </>
  );
}

export default FormInput;
