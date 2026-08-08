import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeData } from '../data';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const AllWorks = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cardColors = ['bg-pink-400', 'bg-cyan-400', 'bg-yellow-300', 'bg-lime-400', 'bg-[#f4f4f0]'];

  return (
    <main className="min-h-screen bg-white dark:bg-black pt-32 pb-24 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        <div className="mb-16 flex flex-col items-start border-b-[6px] border-black dark:border-white pb-8">
          <Link to="/" className="brutal-btn bg-yellow-300 mb-8 flex items-center">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tighter uppercase">All Works & Projects</h1>
          <br/>
          <p className="font-bold text-black dark:text-white mt-4 text-xl bg-cyan-400 inline-block p-4 brutal-border brutal-shadow-sm">
            A complete archive of things I've built, experimented with, and launched.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {resumeData.projects.map((project, index) => {
             const bgColor = cardColors[index % cardColors.length];
             
             return (
              <div 
                key={project.id} 
                className={`brutal-card ${bgColor} dark:bg-gray-800 p-8 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]`}
              >
                <div>
                  <span className="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider brutal-border mb-4">
                    {project.category}
                  </span>
                  <h3 className="text-3xl font-black text-black dark:text-white uppercase mb-4 leading-tight">{project.title}</h3>
                  
                  <p className="text-black dark:text-gray-300 font-bold leading-relaxed text-base border-l-[3px] border-black dark:border-white pl-3 bg-white/50 dark:bg-black/50 p-2">
                    A software project demonstrating my skills in {project.category}. Click below to explore the details.
                  </p>
                </div>
                
                <div className="mt-8 self-start">
                  <a 
                    href={project.link || '#'} 
                    target={project.link ? "_blank" : "_self"} 
                    rel="noreferrer"
                    className="brutal-btn bg-white dark:bg-black group-hover:bg-primary transition-colors flex items-center"
                  >
                    View Project <ExternalLink size={20} className="ml-2" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  );
};

export default AllWorks;

