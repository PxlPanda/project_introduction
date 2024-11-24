import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import MainPage from './pages/MainPage';

// Создаём тему с цветами МИСИС
const theme = createTheme({
  palette: {
    primary: {
      main: '#0050FF',
      light: '#6B7CFF',
      dark: '#0036B3',
    },
    secondary: {
      main: '#FF9100',
      light: '#FFC246',
      dark: '#C56200',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            {/* Здесь можно добавить другие маршруты */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
