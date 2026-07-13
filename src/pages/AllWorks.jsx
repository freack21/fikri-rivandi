import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeData } from '../data';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const AllWorks = () => {
  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-24 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        
        <div className="mb-16 flex flex-col items-start">
          <Link to="/" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors font-medium mb-8 group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">All Works & Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">A complete archive of things I've built, experimented with, and launched.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeData.projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-primary dark:text-blue-400 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
                  {project.category}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h3>
                
                {/* For old projects that are just listed in data, we provide a generic description based on their original HTML structure */}
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                  A software project demonstrating my skills in {project.category}. Click below to explore the details.
                </p>
              </div>
              
              <div className="mt-8">
                <a 
                  href={project.link || '#'} 
                  target={project.link ? "_blank" : "_self"} 
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors group-hover:text-primary dark:group-hover:text-primary cursor-pointer"
                >
                  View Project <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};

export default AllWorks;
