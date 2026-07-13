import React from 'react';
import { resumeData } from '../data';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between">
        
        <div className="w-full md:w-1/2 flex flex-col items-start space-y-6 z-10 relative">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
            Hi, I'm {resumeData.personalInfo.name.split(' ')[0]}. <br className="hidden sm:block" />
            <span className="text-primary">{resumeData.personalInfo.role}</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl">
            Based in Indonesia. Passionate about robotics, IoT, and building seamless full-stack applications.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
            <a 
              href="/#contact" 
              className="px-8 py-4 bg-primary text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center group"
            >
              Get In Touch 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">👋</span>
            </a>
            <a 
              href="/cv.pdf" 
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-medium text-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              Download CV
            </a>
          </div>
        </div>

        {/* Image/Visual Content */}
        <div className="w-full md:w-1/2 mt-16 md:mt-0 relative flex justify-center md:justify-end">
          {/* Abstract Background Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-50 -z-10"></div>
          
          <div className="relative w-72 h-72 md:w-96 md:h-96 xl:w-[450px] xl:h-[450px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <img 
              src="/hero.webp" 
              alt={resumeData.personalInfo.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Floating badge */}
          {/* <div className="absolute bottom-10 -left-10 md:left-10 glass-card dark:bg-gray-800/80 dark:border-gray-700 px-6 py-4 rounded-2xl flex items-center space-x-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold">
              +3
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-sm">Years of</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Experience</p>
            </div>
          </div> */}
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
