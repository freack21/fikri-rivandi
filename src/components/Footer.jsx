import React from 'react';
import { resumeData } from '../data';

const Footer = () => {
  return (
    <footer id="contact" className="bg-yellow-300 dark:bg-primary border-t-[4px] border-black dark:border-white text-black dark:text-white pt-24 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="flex justify-between items-end border-b-[4px] border-black dark:border-white pb-12 mb-12">
          <div className="text-lg md:text-xl font-black uppercase">
            {resumeData.personalInfo.name} <br />
            {resumeData.personalInfo.role}
          </div>
          <div className="text-lg md:text-xl font-black uppercase text-right">
            Based in {resumeData.personalInfo.location.split(',')[0]}
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase">Let's Connect</h2>
          <div className="inline-block border-[3px] border-black dark:border-white bg-white dark:bg-gray-900 p-6 brutal-shadow-sm mb-12">
            <p className="font-bold text-lg md:text-xl">
              I am currently part of digision.id. If you want to discuss technology, collaborations, or just say hi, feel free to reach out!
            </p>
          </div>
          <br />
          <a 
            href={`mailto:${resumeData.personalInfo.email}`}
            className="brutal-btn bg-black text-white dark:bg-white dark:text-black text-xl px-12 py-5"
          >
            Contact Me.
          </a>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-base font-bold uppercase pt-8 border-t-[4px] border-black dark:border-white">
          <p>&copy; {new Date().getFullYear()} {resumeData.personalInfo.name}. All rights reserved.</p>
          
          <div className="flex space-x-6 mt-6 md:mt-0">
            <a href={`https://${resumeData.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline decoration-4 underline-offset-4 transition-all">LinkedIn</a>
            <a href={`https://${resumeData.personalInfo.github}`} target="_blank" rel="noreferrer" className="hover:underline decoration-4 underline-offset-4 transition-all">GitHub</a>
            <a href={`https://${resumeData.personalInfo.instagram}`} target="_blank" rel="noreferrer" className="hover:underline decoration-4 underline-offset-4 transition-all">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

