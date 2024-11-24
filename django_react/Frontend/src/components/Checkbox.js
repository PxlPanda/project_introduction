import React from 'react';
import './Checkbox.css';

function Checkbox({ label, checked, onChange }) {
  return (
    <div className="checkbox">
      <label className="checkbox__label">
        <input
          type="checkbox"
          className="checkbox__input"
          checked={checked}
          onChange={onChange}
        />
        <span className="checkbox__text">{label}</span>
      </label>
    </div>
  );
}

export default Checkbox;
