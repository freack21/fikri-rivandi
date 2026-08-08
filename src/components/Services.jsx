import React, { useState } from 'react';
import { resumeData } from '../data';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const colors = ['bg-yellow-300', 'bg-cyan-400', 'bg-pink-400', 'bg-lime-400'];

  return (
    <section id="services" className="py-24 bg-[#f4f4f0] dark:bg-gray-900 transition-colors duration-300 border-t-[4px] border-black dark:border-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:space-x-20">
          
          {/* Left Column: Sticky Header */}
          <div className="w-full lg:w-1/3 mb-16 lg:mb-0">
            <div className="sticky top-32">
              <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tighter uppercase mb-8 leading-none">
                My <br />
                <span className="inline-block bg-primary text-white px-2 mt-2 brutal-shadow-sm border-[3px] border-black dark:border-white">Services</span>
              </h2>
              <div className="brutal-card bg-white dark:bg-black mb-8 p-6">
                <p className="text-lg font-bold text-black dark:text-white leading-relaxed">
                  With my expertise, you can expect seamless solutions combining robust backend architecture with intuitive, modern interfaces.
                </p>
              </div>
              <a 
                href="/#contact" 
                className="brutal-btn w-full text-center"
              >
                <span>Let's build something</span>
              </a>
            </div>
          </div>

          {/* Right Column: Accordion List */}
          <div className="w-full lg:w-2/3">
            <div className="flex flex-col gap-6">
              {resumeData.services.map((service, index) => {
                const isActive = activeIndex === index;
                const bgColor = isActive ? colors[index % colors.length] : 'bg-white dark:bg-gray-800';
                const textColor = isActive ? 'text-black' : 'text-black dark:text-white';
                
                return (
                  <div 
                    key={service.id}
                    className={`brutal-border transition-all duration-300 ${bgColor} ${isActive ? 'brutal-shadow' : 'brutal-shadow-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)]'}`}
                  >
                    <button
                      onClick={() => setActiveIndex(isActive ? -1 : index)}
                      className="w-full px-6 py-6 md:px-10 md:py-8 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                    >
                      <h3 className={`text-2xl md:text-4xl font-black uppercase tracking-tight transition-colors duration-300 ${textColor}`}>
                        {service.title}
                      </h3>
                      <div className={`transform transition-transform duration-300 border-[3px] border-black bg-white p-2 ${isActive ? 'rotate-90' : 'rotate-0'}`}>
                        <ArrowUpRight size={28} strokeWidth={3} className="text-black" />
                      </div>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out px-6 md:px-10 ${isActive ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0 pb-0'}`}
                    >
                      <p className={`text-base md:text-lg font-bold leading-relaxed max-w-2xl ${textColor}`}>
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

