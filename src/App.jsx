import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AllWorks from './pages/AllWorks';
import WalkingCat from './components/WalkingCat';

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111827' : '#f4f4f0');
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Storage unavailable (private mode, blocked cookies); theme still applies for this session.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className="font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-white transition-colors duration-300">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<AllWorks />} />
        </Routes>
        <Footer />
        <WalkingCat />
      </div>
    </Router>
  );
}

export default App;
