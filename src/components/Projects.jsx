import React from 'react';
import { Link } from 'react-router-dom';
import { resumeData } from '../data';
import { ArrowRight } from 'lucide-react';

const Projects = () => {
  // Only take the first 4 projects for the featured section
  const featuredProjects = resumeData.projects.slice(0, 3);

  return (
    <section id="work" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">My Featured Work</h2>
          <p className="text-base text-gray-500 dark:text-gray-400">
            A selection of my recent projects showing my expertise in development, IoT, and Machine Learning.
          </p>
        </div>

        {/* Masonry-like Grid for Top 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => {
            // Apply different heights/aspect ratios to create a dynamic look like the reference
            const isTall = index === 0;
            const isWide = index === 3;
            
            return (
              <a 
                key={project.id} 
                href={project.link || '#'}
                target={project.link ? "_blank" : "_self"}
                rel="noreferrer"
                className={`group relative rounded-3xl overflow-hidden cursor-pointer block ${isTall ? 'md:row-span-2' : ''} ${isWide ? 'md:col-span-2' : ''}`}
                style={{ height: isTall ? 'auto' : (isWide ? '400px' : '350px') }}
              >
                <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/40 transition-all duration-300 z-10"></div>
                
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ${isTall ? 'min-h-[500px]' : ''}`}
                />
                
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full mb-3 tracking-wide uppercase">
                    {project.category}
                  </span>
                  <div className="flex justify-between items-end">
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{project.title}</h3>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-xl">
                      <ArrowRight size={18} className="text-gray-900" />
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        
        <div className="mt-16 flex justify-center">
          <Link to="/works" className="px-8 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary dark:hover:bg-primary hover:text-white text-gray-900 dark:text-white rounded-full font-medium transition-colors flex items-center group">
            All Works <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
      </div>
    </section>
  );
};

export default Projects;
