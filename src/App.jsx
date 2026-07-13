import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AllWorks from './pages/AllWorks';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 antialiased overflow-x-hidden selection:bg-primary selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<AllWorks />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
