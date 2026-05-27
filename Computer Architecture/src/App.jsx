import React from 'react';
import { useDiagramStore } from './store/diagramStore';
import NavigationMenu from './components/NavigationMenu';
import { SunIcon, MoonIcon } from './components/Icons'; // Extracted icons!

// Import your pages
import LandingPage from './components/LandingPage';
import Chapter1 from './components/Chapter1';
import Chapter2 from './components/Chapter2';
import Chapter3 from './components/Chapter3';
import Chapter5 from './components/Chapter5';

import InstructionPanel from './components/InstructionPanel';
import DiagramCanvas from './components/DiagramCanvas';
import Sidebar from './components/Sidebar';

function App() {
  const { theme, toggleTheme, toggleMenu, currentChapter, isMenuOpen, setIsMenuOpen } = useDiagramStore();

  const renderChapterContent = () => {
    switch (currentChapter) {
      case 0: return <LandingPage />;
      case 1: return <Chapter1 />;
      case 2: return <Chapter2 />;
      case 3: return <Chapter3 />;
      case 5: return <Chapter5 />;
      case 4: 
        return (
          <>
            <InstructionPanel />
            <div className="flex-1 overflow-hidden">
               <DiagramCanvas />
            </div>
            <Sidebar />
          </>
        );
      default: return <LandingPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <NavigationMenu />

      {/* Hide the top header on BOTH the Landing Page (0) AND the CPU Diagram (4) */}
      {currentChapter !== 0 && currentChapter !== 4 && (
        
        // Changed to gap-4 to group everything nicely on the left!
        <header className={`flex items-center p-4 shadow-sm z-10 gap-4 ${theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'}`}>
          
          <button onClick={toggleMenu} className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-bold tracking-wide">
            Chapter {currentChapter}
          </h1>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {renderChapterContent()}
      </main>
    </div>
  );
}

export default App;