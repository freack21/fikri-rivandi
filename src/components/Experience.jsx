import React from 'react';
import { resumeData } from '../data';

import { ExternalLink } from 'lucide-react';

const Experience = () => {
  return (
    <section id="experience" className="py-24 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:space-x-12">
          
          <div className="w-full lg:w-1/3 mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight sticky top-32">
              Work Experiences
            </h2>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="space-y-12">
              {resumeData.experiences.map((exp, index) => (
                <a 
                  key={exp.id} 
                  href={exp.link || '#'}
                  target={exp.link ? "_blank" : "_self"}
                  rel="noreferrer"
                  className={`flex flex-col relative group block ${index !== resumeData.experiences.length - 1 ? 'pb-12 border-b border-gray-200 dark:border-gray-700' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors flex items-center">
                      {exp.role}
                      {exp.link && <ExternalLink size={16} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
                    </h3>
                    <span className="text-primary dark:text-blue-400 font-medium mt-2 md:mt-0 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full text-xs inline-block w-max">
                      {exp.date}
                    </span>
                  </div>
                  
                  <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">{exp.company}</h4>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                    {exp.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Experience;
