import React from 'react';
import { resumeData } from '../data';

const Experience = () => {
  return (
    <section id="experience" className="py-24 bg-white dark:bg-black transition-colors duration-300 border-t-[4px] border-black dark:border-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:space-x-12">
          
          <div className="w-full lg:w-1/3 mb-12 lg:mb-0">
            <div className="sticky top-32">
              <h2 className="text-5xl md:text-6xl font-black text-black dark:text-white tracking-tighter uppercase inline-block border-b-[6px] border-cyan-400 pb-1">
                Experiences
              </h2>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="space-y-10 pl-2 sm:pl-0 border-l-[4px] border-black dark:border-white sm:border-none relative">
              <div className="hidden sm:block absolute left-4 top-0 bottom-0 w-[4px] bg-black dark:bg-white z-0"></div>
              
              {resumeData.experiences.map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="brutal-card bg-[#f4f4f0] dark:bg-gray-800 relative z-10 ml-6 sm:ml-12"
                >
                  <div className="absolute -left-10 sm:-left-[3.25rem] top-6 w-6 h-6 border-[3px] border-black dark:border-white bg-yellow-300 z-20"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-wider">{exp.role}</h3>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-black mt-2 sm:mt-0 px-4 py-1 text-sm inline-block w-max brutal-border">
                      {exp.date}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-primary mb-4 inline-block border-b-[3px] border-black dark:border-white pb-1">{exp.company}</h4>
                  
                  <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Experience;

