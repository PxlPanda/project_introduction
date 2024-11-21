import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Main from './Main.js';
import Login from './Login.js';
import Register from './Register.js';
import ProtectedRouteElement from './ProtectedRoute';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  function handleLogin() {
    setLoggedIn(true);
    navigate('/', { replace: true }); // Перенаправляем на главную страницу
  }

  return (
    <Routes>
      <Route path="*" element={loggedIn ? <Navigate to="/" replace /> : <Navigate to="/signin" replace />} />
      <Route path="/" element={<ProtectedRouteElement element={Main} loggedIn={loggedIn} />} />
      <Route path="/signin" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
