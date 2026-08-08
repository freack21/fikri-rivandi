import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { resumeData } from '../data';

const Navbar = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Work', href: '/#work' },
    { name: 'Experience', href: '/#experience' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#f4f4f0] dark:bg-gray-900 border-b-[3px] border-black dark:border-white py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <a href="/#home" className="text-2xl font-black tracking-tighter uppercase text-black dark:text-white px-2 py-1 brutal-border bg-white dark:bg-gray-800 brutal-shadow-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] transition-all">
          {resumeData.personalInfo.name.split(' ')[0]}<span className="text-primary">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-black dark:text-white font-bold uppercase text-sm border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-yellow-300 dark:hover:bg-primary dark:hover:text-black px-3 py-1 transition-all"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={toggleTheme} 
            className="brutal-border brutal-shadow-sm bg-yellow-300 dark:bg-gray-700 text-black dark:text-white p-2 hover:bg-yellow-400 dark:hover:bg-gray-600 transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] cursor-pointer flex items-center justify-center"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <a href="/#contact" className="brutal-btn">
            Contact Me
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center space-x-3">
          <button 
            onClick={toggleTheme} 
            className="brutal-border brutal-shadow-sm bg-yellow-300 dark:bg-gray-700 text-black dark:text-white p-2 hover:bg-yellow-400 dark:hover:bg-gray-600 transition-all cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button 
            className="brutal-border brutal-shadow-sm bg-white dark:bg-gray-800 text-black dark:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-[#f4f4f0] dark:bg-gray-900 border-b-[3px] border-black dark:border-white flex flex-col py-6 px-6 space-y-4 transition-all duration-300 origin-top shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${isMobileMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'}`}
      >
        {navLinks.map((link) => (
          <a 
            key={link.name} 
            href={link.href}
            className="text-black dark:text-white font-bold uppercase text-lg border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-yellow-300 dark:hover:bg-primary dark:hover:text-black px-4 py-2 transition-all block w-full"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </a>
        ))}

        <a 
          href="/#contact" 
          className="brutal-btn mt-4 w-full text-center"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Contact Me
        </a>
      </div>
    </nav>
  );
};

export default Navbar;

