import React from 'react';
import './Checkbox.css';

function LoginCheckbox({ label, value, onChange }) {

  return (
    <div className="checkbox">
      <input className="checkbox__input" type="checkbox" id="checkbox" checked={value} onChange={onChange} />
      <label className="checkbox__label" htmlFor="checkbox">
        {label}
      </label>
    </div>

  );
}

export default LoginCheckbox;
