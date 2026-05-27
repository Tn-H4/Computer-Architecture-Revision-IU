import React from 'react';
import { useDiagramStore } from '../store/diagramStore';

export default function LandingPage() {
  const { theme, setChapter } = useDiagramStore();

  const chapters = [
    { id: 1, title: "Chapter 1: Introduction", desc: "Welcome to the course and basic concepts." },
    { id: 2, title: "Chapter 2: MIPS Assembly", desc: "Understanding registers and instruction sets." },
    { id: 3, title: "Chapter 3: Machine Code", desc: "Translating assembly into binary." },
    { id: 4, title: "Chapter 4: CPU Data Path", desc: "Interactive visualization of the processor." },
    { id: 5, title: "Chapter 5: Pipelining", desc: "Optimizing CPU performance and hazards." }
  ];

  return (
    <div className={`flex flex-col min-h-screen w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-3xl mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            IU Computer Architecture Revision
          </h1>

        </div>

        {/* Chapter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setChapter(chapter.id)}
              className={`flex flex-col text-left p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">{chapter.title}</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {chapter.desc}
              </p>
            </button>
          ))}
        </div>
      </main>

      {/* Footer (Credits and GitHub Link) */}
      <footer className={`py-6 text-center border-t ${theme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
        
        <p className="mb-2">Built by Tn-H4 • Special thanks to Prof. Cường and Prof. Nga for the original {' '} 
            <a 
            href="https://drive.google.com/drive/folders/1-t6ObUgyjsI_2YVqu16wmaqhp1AI7TOf?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-500 underline decoration-dotted underline-offset-4 transition-colors"
            >
            course materials.
            </a>
        </p>
        <a 
          href="https://github.com/Tn-H4/Computer-Architecture-Revision-IU" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-blue-500 transition-colors font-medium"
        >
          {/* Simple GitHub SVG Icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          View Source on GitHub
        </a>
      </footer>
    </div>
  );
}