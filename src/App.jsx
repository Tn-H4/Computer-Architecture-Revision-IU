import React from 'react';
import { useDiagramStore } from './store/diagramStore';
import { CHAPTERS_WITH_HEADER, FULLSCREEN_CHAPTERS } from './config/chapters.js';
import NavigationMenu from './components/layout/NavigationMenu';
import { SunIcon, MoonIcon } from './components/shared/Icons';
import BugReportModal from './components/layout/BugReportModal';

import LandingPage from './components/layout/LandingPage';
import Chapter1 from './components/chapters/chapter1/Chapter1';
import Chapter2 from './components/chapters/chapter2/Chapter2';
import Chapter3 from './components/chapters/chapter3/Chapter3';
import Chapter5 from './components/chapters/chapter5/Chapter5';
import DatapathLayout from './components/datapath/DatapathLayout';
import PipelinePage from './components/pipeline/PipelinePage';

function App() {
  const { theme, toggleTheme, toggleMenu, currentChapter, setBugModalOpen } = useDiagramStore();

  const renderChapterContent = () => {
    switch (currentChapter) {
      case 0:
        return <LandingPage />;
      case 1:
        return <Chapter1 />;
      case 2:
        return <Chapter2 />;
      case 3:
        return <Chapter3 />;
      case 5:
        return <Chapter5 />;
      case 4.1:
        return <DatapathLayout />;
      case 4.2:
        return (
          <div className="flex-1 overflow-hidden relative">
            <PipelinePage />
          </div>
        );
      default:
        return <LandingPage />;
    }
  };

  const showHeader = !FULLSCREEN_CHAPTERS.includes(currentChapter);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <NavigationMenu />
      <BugReportModal />

      {showHeader && CHAPTERS_WITH_HEADER.includes(currentChapter) && (
        <header className={`flex items-center p-4 shadow-sm z-10 gap-4 ${theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'}`}>
          <button onClick={toggleMenu} className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button onClick={toggleTheme} className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
            {theme === 'dark' ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
          </button>

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

      <main className="flex-1 flex overflow-hidden">
        {renderChapterContent()}
      </main>
    </div>
  );
}

export default App;
