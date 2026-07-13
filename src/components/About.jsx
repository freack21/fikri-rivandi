import React from 'react';
import { resumeData } from '../data';

const About = () => {
  // Split the about text into paragraphs
  const paragraphs = resumeData.personalInfo.about.split('\n\n');

  return (
    <section id="about" className="py-24 bg-gray-50 dark:bg-gray-800/30 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">About Me</h2>
            <div className="space-y-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {paragraphs.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>
            
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h4 className="text-3xl font-bold text-primary dark:text-blue-400 mb-1">10+</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Projects</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-primary dark:text-blue-400 mb-1">3+</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Years Exp.</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-primary dark:text-blue-400 mb-1">15+</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Clients</p>
              </div>
            </div>
            
            <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Tech Stack & Tools</h3>
              <div className="flex flex-wrap gap-2.5">
                {resumeData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full shadow-sm hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Stack */}
          <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
            <div className="relative w-3/4 h-[400px]">
              
              {/* Photo 1 (Bottom Left) */}
              <div className="photo-stack-item absolute inset-0 rounded-2xl overflow-hidden shadow-xl border-8 border-white dark:border-gray-800 rotate-[-8deg] translate-x-[-20px] translate-y-[20px] hover:translate-x-[-40px] hover:translate-y-[0px] hover:rotate-[-4deg] hover:scale-105 hover:z-30 cursor-pointer origin-bottom-left z-0">
                <img 
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop" 
                  alt="IoT and Hardware" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo 2 (Middle Right) */}
              <div className="photo-stack-item absolute inset-0 rounded-2xl overflow-hidden shadow-xl border-8 border-white dark:border-gray-800 rotate-[6deg] translate-x-[30px] translate-y-[-10px] hover:translate-x-[50px] hover:translate-y-[-20px] hover:rotate-[2deg] hover:scale-105 hover:z-30 cursor-pointer origin-bottom-right z-10">
                <img 
                  src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop" 
                  alt="Development Setup" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Photo 3 (Top Center) */}
              <div className="photo-stack-item absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 rotate-[-2deg] hover:translate-y-[-30px] hover:scale-110 hover:rotate-0 hover:z-30 cursor-pointer origin-center z-20">
                <img 
                  src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop" 
                  alt="Coding Session" 
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
            
            <div className="absolute -bottom-2 -left-2 md:-bottom-10 md:-left-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -top-2 -right-2 md:-top-10 md:-right-10 w-32 h-32 bg-gray-200 dark:bg-gray-700/50 rounded-full blur-2xl -z-10 opacity-50"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
