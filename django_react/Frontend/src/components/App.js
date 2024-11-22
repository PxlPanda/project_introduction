import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Main from './Main.js';
import Login from './Login.js';
import Register from './Register.js';
import ProtectedRouteElement from './ProtectedRoute.js';  // Убедитесь, что путь корректен

function App() {
  // Переменная для контроля пропуска входа
  const skipLogin = true;  // Если true — пропускает вход и идет на главную страницу
  const [loggedIn, setLoggedIn] = useState(skipLogin);  // Устанавливаем состояние авторизации

  return (
    <Routes>
      {/* Если skipLogin true, пропускаем авторизацию и показываем Main */}
      <Route path="/" element={skipLogin ? <Main /> : <ProtectedRouteElement element={Main} loggedIn={loggedIn} />} />
      <Route path="/signin" element={<Login onLogin={() => setLoggedIn(true)} />} />
      <Route path="/register" element={<Register />} />
      {/* Редирект на вход, если не авторизован */}
      <Route path="*" element={<Navigate to={loggedIn ? '/' : '/signin'} replace />} />
    </Routes>
  );
}

export default App;
