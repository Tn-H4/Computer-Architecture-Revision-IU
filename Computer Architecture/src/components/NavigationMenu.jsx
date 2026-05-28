import React from 'react';
import { useDiagramStore } from '../store/diagramStore';

export default function NavigationMenu() {
const { isMenuOpen, toggleMenu, currentChapter, setChapter, theme, setBugModalOpen } = useDiagramStore();
  return (
    <>
      {/* Dark overlay that covers the screen when the menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleMenu}
        />
      )}

      {/* The Sliding Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-r border-slate-200'
        } ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`p-4 flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className="text-xl font-bold">IUCA-Revision</h2>
          <button onClick={toggleMenu} className="text-3xl leading-none hover:text-blue-500">
            &times;
          </button>
        </div>

        

        <div className="flex flex-col p-4 space-y-2">
          {/* ADD THE HOME BUTTON HERE */}
          <button 
            onClick={() => setChapter(0)}
            className={`p-3 text-left rounded-md transition-colors mb-4 ${
              currentChapter === 0 
                ? 'bg-blue-600 text-white font-semibold shadow-md' 
                : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            Main Menu
          </button>
          <hr className={`mb-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />

          {/* Your existing chapter list */}
          {[
            { id: 1, title: 'Chapter 1', subtitle: 'CPU Performance' },
            { id: 2, title: 'Chapter 2', subtitle: 'MIPS Instructions' },
            { id: 3, title: 'Chapter 3', subtitle: 'Pipeline Hazards' },
            { id: 4.1, title: 'Chapter 4.1', subtitle: 'CPU Datapath Diagram' }, // The original diagram
            { id: 4.2, title: 'Chapter 4.2', subtitle: 'Pipeline Drag & Drop' }, // The new interactive grid
            { id: 5, title: 'Chapter 5', subtitle: 'Memory Hierarchy' }
          ].map((chapter) => (
            <button 
              key={chapter.id}
              onClick={() => setChapter(chapter.id)}
              className={`p-3 text-left rounded-md transition-colors ${
                currentChapter === chapter.id 
                  ? 'bg-blue-600 text-white font-semibold shadow-md' 
                  : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              {chapter.title}
            </button>
          ))}

          {/* EXTERNAL RESOURCES LINK (Course Slides) */}
          <a 
            href="YOUR_COURSE_SLIDES_LINK_HERE"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 text-left rounded-md transition-colors flex items-center gap-2 ${
              theme === 'dark' ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Original Course Slides
          </a>

          {/* 2. CHANGE FROM <a> TO <button> */}
          <button 
            onClick={() => {
              setBugModalOpen(true);
              toggleMenu(); // Closes the side menu so they can see the popup
            }}
            className={`w-full p-3 text-left rounded-md transition-colors flex items-center gap-2 mt-2 ${
              theme === 'dark' ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report a Bug
          </button>
          
        </div>
      </div>
    </>
  );
}