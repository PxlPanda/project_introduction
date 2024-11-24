import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Main from './Main.js';
import Login from './Login.js';
import ProtectedRouteElement from './ProtectedRoute.js';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Routes>
      <Route path="/signin" element={<Login onLogin={() => setLoggedIn(true)} />} />
      <Route path="/main" element={
        <ProtectedRouteElement 
          element={Main} 
          loggedIn={loggedIn} 
        />
      } />
      <Route path="/" element={<Navigate to={loggedIn ? '/main' : '/signin'} replace />} />
      <Route path="*" element={<Navigate to={loggedIn ? '/main' : '/signin'} replace />} />
    </Routes>
  );
}

export default App;
