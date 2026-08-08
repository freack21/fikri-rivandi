import React from 'react';
import { Link } from 'react-router-dom';
import { resumeData } from '../data';
import { ArrowRight } from 'lucide-react';

const Projects = () => {
  const featuredProjects = resumeData.projects.slice(0, 3);
  const cardColors = ['bg-pink-400', 'bg-cyan-400', 'bg-yellow-300'];

  return (
    <section id="work" className="py-24 bg-white dark:bg-black transition-colors duration-300 border-t-[4px] border-black dark:border-white">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black dark:text-white mb-8 tracking-tighter uppercase inline-block border-b-[6px] border-primary pb-1">Featured Work</h2>
          <br/>
          <div className="bg-[#f4f4f0] dark:bg-gray-800 p-4 md:p-6 brutal-border brutal-shadow-sm inline-block">
             <p className="text-lg md:text-xl font-bold text-black dark:text-white">
               A selection of my recent projects showing my expertise in development, IoT, and Machine Learning.
             </p>
          </div>
        </div>

        {/* Brutalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {featuredProjects.map((project, index) => {
            const isTall = index === 0;
            const bgColor = cardColors[index % cardColors.length];
            
            return (
              <a 
                key={project.id} 
                href={project.link || '#'}
                target={project.link ? "_blank" : "_self"}
                rel="noreferrer"
                className={`group relative brutal-card ${bgColor} cursor-pointer flex flex-col p-0 overflow-hidden brutal-shadow hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all ${isTall ? 'md:row-span-2' : ''}`}
                style={{ minHeight: isTall ? '100%' : '350px' }}
              >
                {/* Image Section */}
                <div className={`border-b-[4px] border-black dark:border-white overflow-hidden relative ${isTall ? 'h-72 md:h-3/4' : 'h-64 sm:h-72 md:h-[250px]'}`}>
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-300 z-10"></div>
                   <img 
                     src={project.image} 
                     alt={project.title} 
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                   />
                </div>
                
                {/* Content Section */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between bg-white dark:bg-gray-800">
                  <div>
                    <span className="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-xs font-black mb-4 uppercase tracking-wider brutal-border">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-black text-black dark:text-white uppercase leading-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  </div>
                  <div className="self-end mt-6">
                    <div className="w-14 h-14 brutal-border brutal-shadow-sm bg-yellow-300 flex items-center justify-center transform group-hover:rotate-[-45deg] group-hover:bg-primary transition-all">
                      <ArrowRight size={28} className="text-black" />
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        
        <div className="mt-20 flex justify-center">
          <Link to="/works" className="brutal-btn group flex items-center">
            All Works <ArrowRight size={24} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        
      </div>
    </section>
  );
};

export default Projects;

