import React, { useState } from 'react';
import Main from './Main.js';
import Login from './Login.js';
import ProtectedRouteElement from "./ProtectedRoute";
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  function handleLogin() {
    setLoggedIn(true);
  }

  function onLogin() {
    handleLogin();
    navigate('/', { replace: true });
  }

  return (
    <Routes>
      <Route path="*" element={loggedIn ? <Navigate to="/" replace /> : <Navigate to="/signin" replace />} />
      <Route path="/" element={<ProtectedRouteElement
        element={Main}
        loggedIn={loggedIn}
      />} />
      <Route path="/signin" element={<Login onLogin={onLogin} />} />
    </Routes>
  );
}

export default App;
