import React, { useState, useEffect } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import InstructionPanel from './InstructionPanel';
import DiagramCanvas from './DiagramCanvas';
import Sidebar from './Sidebar';

export default function DatapathLayout() {
  const { theme, isExpanded, setExpanded } = useDiagramStore();
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- BULLETPROOF EXPAND/RESTORE LOGIC ---
  const handleToggleExpand = () => {
    if (isExpanded) {
      // 1. User clicked RESTORE
      setExpanded(false); 
      
      // ONLY auto-open the side panels if we are on a large desktop/laptop screen.
      // On phones, we leave them closed so they don't cover the screen!
      if (window.innerWidth >= 1024) {
        setIsPanelOpen(true);
        setIsSidebarOpen(true);
      }
    } else {
      // 2. User clicked EXPAND
      setExpanded(true);
      setIsPanelOpen(false);
      setIsSidebarOpen(false);
    }
  };

  // --- MOBILE RESIZE FIX ---
  useEffect(() => {
    let lastWidth = window.innerWidth;
    
    const handleResize = () => {
      // Fixes the "Safari Scroll Bug" by only triggering if the phone is rotated
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        
        if (window.innerWidth < 1024) {
          setIsPanelOpen(false);
          setIsSidebarOpen(false);
        } else {
          // Auto-open on desktop if we aren't expanded
          setIsPanelOpen(true);
          setIsSidebarOpen(true);
        }
      }
    };

    // Set the initial layout state immediately when the component loads
    if (window.innerWidth >= 1024) {
      setIsPanelOpen(true);
      setIsSidebarOpen(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      
      {/* LEFT PANEL: Instructions */}
      <div
        className={`
          absolute left-0 lg:relative z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0
          ${isPanelOpen ? 'translate-x-0 w-80 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
        `}
      >
        <div className={`w-80 h-full border-r ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
          <InstructionPanel onClose={() => setIsPanelOpen(false)} />
        </div>
      </div>

      {/* CENTER PANEL: Diagram Canvas */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden z-10">
        <DiagramCanvas
          onToggleLeft={() => setIsPanelOpen(true)}
          onToggleRight={() => setIsSidebarOpen(true)}
          onToggleExpand={handleToggleExpand}
          isExpanded={isExpanded}
        />
      </div>

      {/* RIGHT PANEL: Sidebar Data */}
      <div
        className={`
          absolute right-0 lg:relative z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0 w-80 shadow-2xl lg:shadow-none' : 'translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
        `}
      >
        <div className={`w-80 h-full border-l ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* MOBILE DARK OVERLAY (Click to close panels) */}
      {(isSidebarOpen || isPanelOpen) && (
        <div 
          className="lg:hidden absolute inset-0 bg-black/40 z-20 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setIsPanelOpen(false);
            setIsSidebarOpen(false);
          }}
        />
      )}
      
    </div>
  );
}