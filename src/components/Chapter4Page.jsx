import React, { useState, useEffect } from 'react';
import Chapter4_2 from './Chapter4_2';
import HazardSidebar from './HazardSidebar';

const Chapter4Page = () => {
  const [sharedInstructions, setSharedInstructions] = useState([]);
  const [sharedGrid, setSharedGrid] = useState(Array(10).fill(null).map(() => Array(20).fill(null)));
  const [exerciseMode, setExerciseMode] = useState('stall');

  // --- RESPONSIVE STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Automatically close sidebar on smaller screens on initial load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Trigger on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      
      {/* Left Content Side (Main Grid) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Chapter4_2 
          externalInstructions={sharedInstructions} 
          setExternalInstructions={setSharedInstructions} 
          externalGrid={sharedGrid}
          setExternalGrid={setSharedGrid}
          exerciseMode={exerciseMode}
          setExerciseMode={setExerciseMode}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />
      </div>

      {/* Right Sidebar Side */}
      <div 
        className={`
          absolute right-0 lg:relative z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-80' : 'translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
        `}
      >
        <div className="w-[85vw] sm:w-80 h-full shadow-xl lg:shadow-none border-l border-slate-800 bg-slate-900">
          <HazardSidebar 
            theme="dark" 
            setGridInstructions={setSharedInstructions} 
            userGrid={sharedGrid}
            exerciseMode={exerciseMode}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
    </div>
  );
};

export default Chapter4Page;