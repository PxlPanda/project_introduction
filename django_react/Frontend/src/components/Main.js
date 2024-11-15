import React from 'react';
import { useNavigate } from 'react-router-dom';

function Main() {

  const navigate = useNavigate();

  function systemLogout() {
    localStorage.removeItem('isAuthorized');
    navigate('/signin', { replace: true });
  }

  return (
    <main>
      <p>Some content here</p>
    </main>
  );
}

export default Main;
