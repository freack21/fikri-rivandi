import React from 'react';
import { resumeData } from '../data';
import WorkspaceScene from './WorkspaceScene';

const About = () => {
  const paragraphs = resumeData.personalInfo.about.split('\n\n');
  const bgColors = ['bg-yellow-300', 'bg-cyan-400', 'bg-pink-400', 'bg-white', 'bg-lime-400', 'bg-orange-400'];

  return (
    <section id="about" className="py-24 bg-[#f4f4f0] dark:bg-black transition-colors duration-300 border-t-[4px] border-black dark:border-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-16">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="inline-block mb-8 self-start">
               <h2 className="text-5xl md:text-6xl font-black text-black dark:text-white tracking-tighter uppercase inline-block border-b-[6px] border-primary pb-1">About Me</h2>
            </div>
            
            <div className="brutal-card bg-white dark:bg-gray-800 space-y-4 text-base md:text-lg text-black dark:text-white font-bold leading-relaxed relative">
              {/* Decorative block */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary brutal-border transform rotate-12 hidden md:block"></div>
              
              {paragraphs.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>
            
            <div className="mt-16">
              <h3 className="text-2xl font-black text-black dark:text-white mb-6 uppercase tracking-wider border-l-[4px] border-black dark:border-white pl-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-3">
                {resumeData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`px-4 py-2 ${bgColors[index % bgColors.length]} dark:bg-gray-800 brutal-border brutal-shadow-sm text-black dark:text-white text-sm font-black uppercase tracking-wider hover:-translate-y-1 transition-transform cursor-default`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Workspace */}
          <div className="w-full md:w-1/2 relative flex items-center justify-center mt-10 md:mt-0">
            <div className="relative w-full max-w-xl mx-auto">
              <div className="absolute inset-0 bg-pink-400 brutal-border translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6"></div>
              <div className="workspace-frame relative brutal-border brutal-shadow bg-cyan-300 dark:bg-gray-800 aspect-[4/3] overflow-hidden">
                <WorkspaceScene className="absolute inset-0" />
                <span className="absolute top-3 left-3 bg-yellow-300 text-black brutal-border px-3 py-1 text-xs font-black uppercase tracking-widest pointer-events-none">
                  ~/workspace
                </span>
                <span className="absolute bottom-3 right-3 bg-white text-black brutal-border px-3 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-2 pointer-events-none">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                  Live coding
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;

