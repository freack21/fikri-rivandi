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

          {/* Image */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000&auto=format&fit=crop" 
                alt="Fikri coding" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full -z-10"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gray-200 dark:bg-gray-700/50 rounded-full -z-10 opacity-50"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
