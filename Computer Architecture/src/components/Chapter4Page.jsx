import React, { useState } from 'react';
import Chapter4_2 from './Chapter4_2';
import HazardSidebar from './HazardSidebar';

const Chapter4Page = () => {
  const [sharedInstructions, setSharedInstructions] = useState([]);
  const [sharedGrid, setSharedGrid] = useState(Array(10).fill(null).map(() => Array(20).fill(null)));
  
  // Lift exercise mode state up to the parent wrapper
  const [exerciseMode, setExerciseMode] = useState('stall');

  return (
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* Left Content Side */}
      <div className="flex-1 min-w-0">
        <Chapter4_2 
          externalInstructions={sharedInstructions} 
          setExternalInstructions={setSharedInstructions} 
          externalGrid={sharedGrid}
          setExternalGrid={setSharedGrid}
          exerciseMode={exerciseMode}
          setExerciseMode={setExerciseMode}
        />
      </div>

      {/* Right Sidebar Side */}
      <HazardSidebar 
        theme="dark" 
        setGridInstructions={setSharedInstructions} 
        userGrid={sharedGrid}
        exerciseMode={exerciseMode}
      />
      
    </div>
  );
};

export default Chapter4Page;