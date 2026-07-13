import React from 'react';
import { resumeData } from '../data';
import { Code, Cpu, Brain, Layers, ArrowUpRight } from 'lucide-react';

const iconMap = {
  Code: <Code size={28} strokeWidth={1.5} />,
  Cpu: <Cpu size={28} strokeWidth={1.5} />,
  Brain: <Brain size={28} strokeWidth={1.5} />,
  Layers: <Layers size={28} strokeWidth={1.5} />
};

const Services = () => {
  return (
    <section id="services" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:space-x-12">
          
          {/* Left Column: Sticky Header */}
          <div className="w-full lg:w-1/3 mb-12 lg:mb-0">
            <div className="sticky top-32">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
                My Awesome Services
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                With my expertise, you can expect seamless solutions combining robust backend architecture with intuitive, modern interfaces.
              </p>
              <a 
                href="/#contact" 
                className="inline-flex items-center space-x-2 text-primary font-medium hover:text-blue-700 transition-colors group"
              >
                <span>Let's build something</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: 2x2 Bento Grid */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {resumeData.services.map((service) => (
                <div 
                  key={service.id}
                  className="bg-gray-50 dark:bg-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-8 right-8 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight size={24} />
                  </div>
                  
                  <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 mb-8 group-hover:bg-primary group-hover:text-white dark:group-hover:text-white group-hover:border-primary transition-all duration-300">
                    {iconMap[service.icon]}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                    {service.description}
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

export default Services;
