import React, { useState, useEffect } from 'react';
import PipelineGrid from './PipelineGrid';
import HazardSidebar from './HazardSidebar';

const INITIAL_INSTRUCTIONS = [
  'lw $t1, 0($t0)', 'lw $t2, 4($t0)', 'add $t3, $t1, $t2', 'sw $t3, 12($t0)', 
  'lw $t4, 8($t0)', 'sub $t5, $t1, $t3', 'and $t6, $t2, $t4', 'or $t7, $t5, $t6', 
  'slt $t8, $t6, $t7', 'beq $t1, $t2, label'
];

export default function PipelinePage() {
  const [sharedInstructions, setSharedInstructions] = useState(INITIAL_INSTRUCTIONS);
  const [sharedGrid, setSharedGrid] = useState(Array(10).fill(null).map(() => Array(20).fill(null)));
  const [exerciseMode, setExerciseMode] = useState('stall');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      
      <div className="flex-1 min-w-0 flex flex-col">
        <PipelineGrid 
          externalInstructions={sharedInstructions} 
          setExternalInstructions={setSharedInstructions} 
          externalGrid={sharedGrid}
          setExternalGrid={setSharedGrid}
          exerciseMode={exerciseMode}
          setExerciseMode={setExerciseMode}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />
      </div>

      <div 
        className={`
          absolute right-0 lg:relative z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-80' : 'translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
        `}
      >
        <div className="w-[85vw] sm:w-80 h-full shadow-xl lg:shadow-none border-l border-slate-800 bg-slate-900">
          <HazardSidebar 
            userInstructions={sharedInstructions} 
            setGridInstructions={setSharedInstructions} 
            userGrid={sharedGrid}
            exerciseMode={exerciseMode}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {isSidebarOpen && (
        <div 
          className="lg:hidden absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
    </div>
  );
};