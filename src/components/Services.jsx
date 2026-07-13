import React, { useState } from 'react';
import { resumeData } from '../data';
import { ArrowUpRight } from 'lucide-react';

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="services" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:space-x-20">
          
          {/* Left Column: Sticky Header */}
          <div className="w-full lg:w-1/3 mb-16 lg:mb-0">
            <div className="sticky top-32">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
                My Awesome Services
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                With my expertise, you can expect seamless solutions combining robust backend architecture with intuitive, modern interfaces.
              </p>
              <a 
                href="/#contact" 
                className="inline-flex items-center space-x-2 text-primary font-medium text-lg hover:text-blue-700 transition-colors group"
              >
                <span>Let's build something</span>
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Accordion List */}
          <div className="w-full lg:w-2/3">
            <div className="flex flex-col">
              {/* Top border for the first item */}
              <div className="border-t border-gray-200 dark:border-gray-800"></div>
              
              {resumeData.services.map((service, index) => {
                const isActive = activeIndex === index;
                
                return (
                  <div 
                    key={service.id}
                    className="border-b border-gray-200 dark:border-gray-800 group"
                  >
                    <button
                      onClick={() => setActiveIndex(isActive ? -1 : index)}
                      className="w-full py-8 md:py-10 flex items-start justify-between text-left focus:outline-none"
                    >
                      <h3 className={`text-3xl md:text-5xl font-normal tracking-tight transition-colors duration-300 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                        {service.title}
                      </h3>
                      <div className={`mt-1 transform transition-all duration-500 ${isActive ? 'text-primary translate-x-2 -translate-y-2' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                        <ArrowUpRight size={36} strokeWidth={1} />
                      </div>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-96 opacity-100 pb-10' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl font-light">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Services;
