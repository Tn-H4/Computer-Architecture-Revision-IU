import React from 'react';
import { useDiagramStore } from '../store/diagramStore';

export default function NavigationMenu() {
  const { isMenuOpen, toggleMenu, currentChapter, setChapter, theme } = useDiagramStore();

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
            { id: 1, title: "Chapter 1: Introduction" },
            { id: 2, title: "Chapter 2: MIPS Assembly" },
            { id: 3, title: "Chapter 3: Machine Code" },
            { id: 4, title: "Chapter 4: CPU Data Path" },
            { id: 5, title: "Chapter 5: Pipelining" }
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
        </div>
      </div>
    </>
  );
}