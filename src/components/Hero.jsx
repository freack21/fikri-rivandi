import React from 'react';
import { resumeData } from '../data';
import { Send, Download } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-[#f4f4f0] dark:bg-gray-900 transition-colors duration-300 relative">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between relative z-10">
        
        <div className="w-full md:w-1/2 flex flex-col items-start space-y-8 z-10 relative mt-12 md:mt-0">
          <div className="inline-block bg-yellow-300 px-4 py-2 brutal-border brutal-shadow-sm transform -rotate-2">
            <span className="font-bold text-black uppercase tracking-wider text-sm md:text-base">Hello World!</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-black dark:text-white leading-[1.1] tracking-tighter uppercase">
            I'm {resumeData.personalInfo.name.split(' ')[0]}. <br />
            <span className="bg-primary text-white px-2 mt-2 inline-block brutal-shadow-sm border-2 border-black dark:border-white">
              {resumeData.personalInfo.role}
            </span>
          </h1>
          
          <div className="p-6 bg-white dark:bg-black brutal-border brutal-shadow-sm max-w-xl">
             <p className="text-lg md:text-xl font-bold text-black dark:text-white">
               Based in Indonesia. Passionate about robotics, IoT, and building seamless full-stack applications.
             </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4 w-full sm:w-auto">
            <a 
              href="/#contact" 
              className="brutal-btn w-full sm:w-auto"
            >
              Get In Touch 
              <Send className="ml-2 w-5 h-5" />
            </a>
            <a 
              href="/cv.pdf" 
              target="_blank"
              rel="noreferrer"
              className="brutal-btn bg-white dark:bg-gray-800 text-black dark:text-white w-full sm:w-auto"
            >
              <Download className="mr-2 w-5 h-5" />
              Download CV
            </a>
          </div>
        </div>

        {/* Image/Visual Content */}
        <div className="w-full md:w-1/2 mt-20 md:mt-0 relative flex justify-center md:justify-end">
          
          {/* Brutalist abstract shape behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 xl:w-[450px] xl:h-[450px] bg-cyan-400 brutal-border transform translate-x-6 translate-y-6 z-0"></div>
          
          <div className="relative w-64 h-64 md:w-80 md:h-80 xl:w-[450px] xl:h-[450px] bg-white dark:bg-gray-800 brutal-border brutal-shadow transform -rotate-3 hover:rotate-0 transition-transform duration-300 z-10 p-2">
            <img 
              src="/hero.webp" 
              alt={resumeData.personalInfo.name} 
              className="w-full h-full object-cover brutal-border grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
          
          {/* Floating badge */}
          <div className="absolute -bottom-6 -left-6 md:left-10 bg-yellow-300 brutal-border brutal-shadow p-4 z-20 transform rotate-6 hover:-rotate-6 transition-transform cursor-default">
            <div className="text-black font-black text-4xl text-center">
              +3
            </div>
            <div className="text-black font-bold uppercase text-xs text-center border-t-[3px] border-black pt-1 mt-1 tracking-wider">
              Years Exp.
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;

