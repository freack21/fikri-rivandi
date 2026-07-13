import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Experience from '../components/Experience';
import Projects from '../components/Projects';

const Home = () => {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <Experience />
      <Projects />
    </main>
  );
};

export default Home;
