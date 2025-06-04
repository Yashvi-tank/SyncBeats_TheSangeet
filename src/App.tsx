import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #1f2937)',
              color: 'var(--toast-color, #f9fafb)',
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;