import React from 'react';
import { resumeData } from '../data';

const About = () => {
  const paragraphs = resumeData.personalInfo.about.split('\n\n');
  const bgColors = ['bg-yellow-300', 'bg-cyan-400', 'bg-pink-400', 'bg-white', 'bg-lime-400', 'bg-orange-400'];

  return (
    <section id="about" className="py-24 bg-[#f4f4f0] dark:bg-black transition-colors duration-300 border-t-[4px] border-black dark:border-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-16">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="inline-block mb-8 self-start">
               <h2 className="text-5xl md:text-6xl font-black text-black dark:text-white tracking-tighter uppercase inline-block border-b-[6px] border-primary pb-1">About Me</h2>
            </div>
            
            <div className="brutal-card bg-white dark:bg-gray-800 space-y-4 text-base md:text-lg text-black dark:text-white font-bold leading-relaxed relative">
              {/* Decorative block */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary brutal-border transform rotate-12 hidden md:block"></div>
              
              {paragraphs.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>
            
            <div className="mt-16">
              <h3 className="text-2xl font-black text-black dark:text-white mb-6 uppercase tracking-wider border-l-[4px] border-black dark:border-white pl-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-3">
                {resumeData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`px-4 py-2 ${bgColors[index % bgColors.length]} dark:bg-gray-800 brutal-border brutal-shadow-sm text-black dark:text-white text-sm font-black uppercase tracking-wider hover:-translate-y-1 transition-transform cursor-default`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Stack */}
          <div className="w-full md:w-1/2 relative min-h-[500px] flex items-center justify-center mt-10 md:mt-0">
            <div className="relative w-full h-[350px] sm:h-[450px] max-w-md mx-auto">
              
              {/* Photo 1 (Bottom Left) */}
              <div className="absolute inset-0 brutal-border brutal-shadow bg-pink-400 rotate-[-8deg] translate-x-[-20px] translate-y-[20px] hover:translate-x-[-30px] hover:translate-y-[10px] hover:rotate-[-4deg] transition-all duration-300 z-0 p-2 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop" 
                  alt="IoT and Hardware" 
                  className="w-full h-full object-cover brutal-border grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Photo 2 (Middle Right) */}
              <div className="absolute inset-0 brutal-border brutal-shadow bg-cyan-400 rotate-[6deg] translate-x-[30px] translate-y-[-10px] hover:translate-x-[40px] hover:translate-y-[-20px] hover:rotate-[2deg] transition-all duration-300 z-10 p-2 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=800&auto=format&fit=crop" 
                  alt="Development Setup" 
                  className="w-full h-full object-cover brutal-border grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Photo 3 (Top Center) */}
              <div className="absolute inset-0 brutal-border brutal-shadow bg-yellow-300 rotate-[-2deg] hover:translate-y-[-10px] hover:rotate-0 transition-all duration-300 z-20 p-2 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop" 
                  alt="Coding Session" 
                  className="w-full h-full object-cover brutal-border transition-all duration-500"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;

