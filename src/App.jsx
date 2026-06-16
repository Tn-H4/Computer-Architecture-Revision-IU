import React, { useState, useEffect } from 'react';
import { useDiagramStore } from './store/diagramStore';
import NavigationMenu from './components/NavigationMenu';
import { SunIcon, MoonIcon } from './components/Icons'; 
import BugReportModal from './components/BugReportModal';

import LandingPage from './components/LandingPage';
import Chapter1 from './components/Chapter1';
import Chapter2 from './components/Chapter2';
import Chapter3 from './components/Chapter3';
import Chapter5 from './components/Chapter5';

import InstructionPanel from './components/InstructionPanel';
import DiagramCanvas from './components/DiagramCanvas';
import Sidebar from './components/Sidebar';
import Chapter4_2 from './components/Chapter4Page'; 

function App() {
  const { theme, toggleTheme, toggleMenu, currentChapter, setBugModalOpen } = useDiagramStore();
  
  // --- RESPONSIVE STATE FOR CHAPTER 4.1 ---
  const [isPanelOpen, setIsPanelOpen] = useState(true);   // Left Panel (Instructions)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Right Panel (Sidebar/Menu)

  const handleToggleExpand = () => {
    if (isPanelOpen || isSidebarOpen) {
      setIsPanelOpen(false);
      setIsSidebarOpen(false);
    } else {
      setIsPanelOpen(true);
      setIsSidebarOpen(true);
    }
  };

  // Automatically close sidebars on smaller screens on initial load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsPanelOpen(false);
        setIsSidebarOpen(false);
      } else {
        setIsPanelOpen(true);
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Trigger on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderChapterContent = () => {
    switch (currentChapter) {
      case 0: return <LandingPage />;
      case 1: return <Chapter1 />;
      case 2: return <Chapter2 />;
      case 3: return <Chapter3 />;
      case 5: return <Chapter5 />;
      
      case 4.1: // Responsive Interactive CPU Diagram
        return (
          <div className="flex h-full w-full relative overflow-hidden">
            
            {/* ================= LEFT INSTRUCTION PANEL ================= */}
            <div 
              className={`
                absolute left-0 lg:relative z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0
                ${isPanelOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
              `}
            >
              <div className={`w-80 h-full shadow-xl lg:shadow-none border-r ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                <InstructionPanel onClose={() => setIsPanelOpen(false)} />
              </div>
            </div>

            {/* ================= MAIN DIAGRAM CANVAS ================= */}
            <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden z-10">
              
              <DiagramCanvas 
                onToggleLeft={() => setIsPanelOpen(true)} 
                onToggleRight={() => setIsSidebarOpen(true)} 
                onToggleExpand={handleToggleExpand} // ADDED
                isExpanded={!isPanelOpen && !isSidebarOpen} // ADDED
              />
              
            </div>

            {/* ================= RIGHT SIDEBAR ================= */}
            <div 
              className={`
                absolute right-0 lg:relative z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0 w-80' : 'translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
              `}
            >
              <div className={`w-80 h-full shadow-xl lg:shadow-none border-l ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
              </div>
            </div>

            {/* ================= MOBILE BACKDROP OVERLAY ================= */}
            {(isSidebarOpen || isPanelOpen) && (
              <div 
                className="lg:hidden absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-20 transition-opacity"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsPanelOpen(false);
                }}
              />
            )}

          </div>
        );

      case 4.2: // New Drag and Drop Pipeline
        return (
          <>
            <div className="flex-1 overflow-hidden relative">
               <Chapter4_2 /> 
            </div>
          </>
        );
        
      default: return <LandingPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <NavigationMenu />
      <BugReportModal />

      {currentChapter !== 0 && currentChapter !== 4.1 && currentChapter !== 4.2 && (
        <header className={`flex items-center p-4 shadow-sm z-10 gap-4 ${theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'}`}>
          
          {/* Hamburger Menu */}
          <button onClick={toggleMenu} className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
             {theme === 'dark' ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* THIS PUSHES THE BUG BUTTON TO THE RIGHT */}
          <div className="flex-1"></div> 

          <button 
            onClick={() => setBugModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors border ${
              theme === 'dark' 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' 
                : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Bug
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