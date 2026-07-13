import React from 'react';
import { resumeData } from '../data';
import { Code, Cpu, Brain, Layers } from 'lucide-react';

const iconMap = {
  Code: <Code size={32} strokeWidth={1.5} />,
  Cpu: <Cpu size={32} strokeWidth={1.5} />,
  Brain: <Brain size={32} strokeWidth={1.5} />,
  Layers: <Layers size={32} strokeWidth={1.5} />
};

const Services = () => {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">My Awesome Services</h2>
          <p className="text-base text-gray-500">
            With my expertise, you can expect seamless solutions combining robust backend architecture with intuitive, modern interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resumeData.services.map((service) => (
            <div 
              key={service.id}
              className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {iconMap[service.icon]}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
