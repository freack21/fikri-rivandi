import React from 'react';
import { resumeData } from '../data';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 dark:bg-black text-white pt-24 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="flex justify-between items-end border-b border-gray-800 dark:border-gray-900 pb-12 mb-12">
          <div className="text-sm text-gray-400 font-medium">
            {resumeData.personalInfo.name} <br />
            {resumeData.personalInfo.role}
          </div>
          <div className="text-sm text-gray-400 font-medium text-right">
            Based in {resumeData.personalInfo.location.split(',')[0]}
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Let's Work Together</h2>
          <p className="text-gray-400 text-base mb-10">
            Together, we can make your vision come to life and leave a lasting impact in the digital realm.
          </p>
          <a 
            href={`mailto:${resumeData.personalInfo.email}`}
            className="inline-block px-10 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Hire Me.
          </a>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-medium pt-8 border-t border-gray-800">
          <p>&copy; {new Date().getFullYear()} {resumeData.personalInfo.name}. All rights reserved.</p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href={`https://${resumeData.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href={`https://${resumeData.personalInfo.github}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href={`https://${resumeData.personalInfo.instagram}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
