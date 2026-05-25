import React, { useState, useEffect } from 'react'; // <-- Import useEffect
import { useDiagramStore } from '../store/diagramStore';

export default function InstructionPanel() {
  const { 
    activeInstruction, setActiveInstruction,
    clearWires, interactionMode, setInteractionMode,
    userSelectedWires, theme, toggleTheme,
    verifyPracticeWires, practiceVerificationResult,
    showAnswerKey, setShowAnswerKey // Assuming these are added to your diagramStore
  } = useDiagramStore();

  // Local state for UI feedback if you prefer not to put this specific toggle in the store
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setPracticeChecked(false);
    setIsCorrect(false);
    setShowKey(false);
  }, [activeInstruction]);

  const handleCheckAnswers = () => {
    // In a real implementation, you'd call a store function:
    // const result = verifyPracticeWires();
    // setIsCorrect(result);
    
    // Placeholder logic for demonstration: Assumes it's wrong just to show the button
    const correct = false; 
    setPracticeChecked(true);
    setIsCorrect(correct);
    setShowKey(false); 
    
    // If you added setShowAnswerKey to zustand:
    if (setShowAnswerKey) setShowAnswerKey(false); 
  };

  const handleShowAnswerKey = () => {
    setShowKey(true);
    // Trigger store update so Diagram can highlight the correct wires in green/red
    if (setShowAnswerKey) setShowAnswerKey(true);
  };

  const resetPractice = () => {
    setPracticeChecked(false);
    setIsCorrect(false);
    setShowKey(false);
    if (setShowAnswerKey) setShowAnswerKey(false);
    clearWires();
  };

  const handleModeChange = (mode) => {
    setInteractionMode(mode);
    resetPractice();
  };

  return (
    <div className={`w-80 border-r p-6 flex flex-col h-screen z-20 shadow-xl overflow-y-auto transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* HEADER & THEME TOGGLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          CPU<span className="text-sky-500">Sim</span>
        </h1>
        <button 
          onClick={toggleTheme} 
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* MODE SELECTOR */}
      <div className={`p-1 rounded-lg flex gap-1 mb-8 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
        <button 
          onClick={() => handleModeChange('explore')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
            interactionMode === 'explore' 
              ? 'bg-sky-600 text-white shadow-sm' 
              : `hover:text-sky-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`
          }`}
        >
          Explore
        </button>
        <button 
          onClick={() => handleModeChange('practice_click')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
            interactionMode === 'practice_click' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : `hover:text-purple-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`
          }`}
        >
          Practice
        </button>
      </div>

      {/* EXPLORE MODE UI */}
      {interactionMode === 'explore' && (
        <div className="flex flex-col gap-3">
          <h2 className={`text-xl font-bold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
            Simulate
          </h2>

          {['add', 'addi', 'lw', 'sw', 'beq'].map((inst) => (
             <button 
               key={inst}
               onClick={() => setActiveInstruction(inst)} 
               className={`py-3 px-4 rounded-lg text-left font-mono text-sm transition-colors shadow-md ${
                 activeInstruction === inst 
                  ? (inst === 'lw' ? 'bg-emerald-600 shadow-emerald-500/20' 
                     : inst === 'sw' ? 'bg-purple-600 shadow-purple-500/20'
                     : inst === 'beq' ? 'bg-orange-600 shadow-orange-500/20'
                     : 'bg-sky-600 shadow-sky-500/20') + ' text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
               }`}
             >
               {inst === 'add' ? 'add $s0, $s1, $s2' : 
                inst === 'addi' ? 'addi $s0, $s1, 100' : 
                inst === 'lw' ? 'lw $t0, 4($s1)' : 
                inst === 'sw' ? 'sw $s0, 4($s2)' : 
                'beq $s1, $s0, L1'}
             </button>
          ))}

          <button 
            onClick={clearWires}
            className={`mt-8 py-2 px-4 rounded text-center text-sm transition-colors border ${
              theme === 'dark' 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
            }`}
          >
            Turn Off Lights
          </button>
        </div>
      )}

      {/* PRACTICE MODE UI */}
      {interactionMode === 'practice_click' && (
        <div className="flex flex-col gap-3">
          <h2 className={`text-xl font-bold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
            Trace the Path
          </h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
            Click the wires on the diagram that would be active for the instruction.
          </p>
          
          <div className={`border p-4 rounded-lg text-sm mb-4 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            Wires Selected: <span className="font-bold text-purple-500">{userSelectedWires.length}</span>
          </div>

          {!practiceChecked ? (
            <button 
              onClick={handleCheckAnswers}
              className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg"
            >
              Verify Selection
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className={`p-3 rounded-lg font-bold text-center ${isCorrect ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-600/20 text-rose-400 border border-rose-500/50'}`}>
                {isCorrect ? 'Correct Path Selected!' : 'Incorrect Wires Selected'}
              </div>
              
              {!isCorrect && !showKey && (
                <button 
                  onClick={handleShowAnswerKey}
                  className="bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded-lg font-bold transition-all shadow-lg"
                >
                  Show Answer Key
                </button>
              )}

              <button 
                onClick={resetPractice}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-bold transition-all shadow-lg mt-2"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}