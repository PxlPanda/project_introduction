import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Регистрация успешна!');
        window.location.href = '/signin';
      } else {
        const data = await response.json();
        alert(data.message || 'Ошибка регистрации.');
      }
    } catch (error) {
      console.error('Ошибка сервера:', error);
      alert('Ошибка сервера. Попробуйте позже.');
    }
  };

  return (
    <section className="register">
      <h2>Регистрация</h2>
      <form onSubmit={handleRegister}>
        <input type="text" name="name" placeholder="Имя" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </section>
  );
}

export default Register;
