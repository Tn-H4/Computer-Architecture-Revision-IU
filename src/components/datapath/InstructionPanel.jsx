import React, { useState, useEffect } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { SunIcon, MoonIcon } from '../shared/Icons'; 

// --- SCROLLBAR STYLES ---
const PanelScrollbarStyles = ({ theme }) => (
  <style>{`
    .panel-scroll::-webkit-scrollbar {
      width: 8px;
    }
    .panel-scroll::-webkit-scrollbar-track {
      background: ${theme === 'dark' ? '#1e293b' : '#f1f5f9'};
      border-radius: 8px;
    }
    .panel-scroll::-webkit-scrollbar-thumb {
      background: ${theme === 'dark' ? '#475569' : '#94a3b8'};
      border-radius: 8px;
      border: 2px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'};
    }
    .panel-scroll::-webkit-scrollbar-thumb:hover {
      background: ${theme === 'dark' ? '#64748b' : '#64748b'};
    }
  `}</style>
);

export default function InstructionPanel({ onClose }) {
  const { 
    activeInstruction, setActiveInstruction,
    clearWires, interactionMode, setInteractionMode,
    userSelectedWires, theme, toggleTheme,
    toggleMenu,       
    currentChapter,   
    practiceInput, setPracticeInput, verifyPracticeSubmission,
    setShowAnswerKey, verificationState 
  } = useDiagramStore();

  const [practiceChecked, setPracticeChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setPracticeChecked(false);
    setIsCorrect(false);
    setShowKey(false);
    if (setShowAnswerKey) setShowAnswerKey(false);
  }, [activeInstruction, interactionMode, setShowAnswerKey]);

  const handleCheckAnswers = () => {
    try {
      const result = verifyPracticeSubmission(); 
      setPracticeChecked(true);
      setIsCorrect(result);
      setShowKey(false); 
      if (setShowAnswerKey) setShowAnswerKey(false); 
    } catch (e) {
      console.error("Crash on button click:", e);
    }
  };

  const handleShowAnswerKey = () => {
    setShowKey(true);
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

  const handleRandomize = () => {
    const opcodes = ['add', 'sub', 'addi', 'lw', 'sw', 'beq'];
    const destRegs = ['$s0', '$s1', '$s2', '$t0', '$t1', '$t2', '$a0', '$v0'];
    const srcRegs = [...destRegs, '$zero']; 

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const opcode = getRandom(opcodes);
    let generatedInst = '';

    switch (opcode) {
      case 'add':
      case 'sub': { 
        generatedInst = `${opcode} ${getRandom(destRegs)}, ${getRandom(srcRegs)}, ${getRandom(srcRegs)}`;
        break;
      }
      case 'addi': { 
        const imm = Math.floor(Math.random() * 201) - 100; 
        generatedInst = `${opcode} ${getRandom(destRegs)}, ${getRandom(srcRegs)}, ${imm}`;
        break;
      }
      case 'lw':
      case 'sw': { 
        const offset = Math.floor(Math.random() * 16) * 4; 
        generatedInst = `${opcode} ${getRandom(destRegs)}, ${offset}(${getRandom(srcRegs)})`;
        break;
      }
      case 'beq': { 
        const branchTarget = Math.floor(Math.random() * 25) + 1;
        generatedInst = `beq ${getRandom(srcRegs)}, ${getRandom(srcRegs)}, ${branchTarget}`;
        break;
      }
      default:
        generatedInst = 'add $s0, $s1, $s2';
    }

    setPracticeInput(generatedInst);
    resetPractice();
  };

  return (
    <>
      {/* Inject custom scrollbar CSS */}
      <PanelScrollbarStyles theme={theme} />

      <div className={`w-80 border-r flex flex-col h-screen z-20 shadow-xl overflow-y-auto panel-scroll transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        <div className={`flex justify-between items-center p-2 lg:hidden shrink-0 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ml-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Instructions
          </span>
          <button 
            onClick={onClose} 
            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600' 
                : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
            }`}
          >
            ✕ Close
          </button>
        </div>

        {/* COMPACT HEADER */}
        <div className={`flex items-center p-3 border-b gap-3 shrink-0 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button 
            onClick={toggleMenu}
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <span className="font-bold text-sm tracking-wide flex-1">
            {currentChapter === 1 ? 'Ch 1' : 'Chapter 4.1'}
          </span>

          <button onClick={toggleTheme} className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border shrink-0 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}>
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex flex-col flex-1 p-5">
          
          {/* MODE SELECTOR */}
          <div className={`p-1 rounded-lg flex gap-1 mb-8 shrink-0 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
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
            <div className="flex flex-col gap-3 pb-8">
              <h2 className={`text-xl font-bold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
                Simulate
              </h2>

              {['add', 'addi', 'lw', 'sw', 'beq'].map((inst) => (
                 <button 
                   key={inst}
                   onClick={() => setActiveInstruction(inst)} 
                   className={`py-3 px-4 rounded-lg text-left font-mono text-sm transition-all shadow-md ${
                     activeInstruction === inst 
                      ? (inst === 'lw' ? 'bg-emerald-600 shadow-emerald-500/30' 
                         : inst === 'sw' ? 'bg-purple-600 shadow-purple-500/30'
                         : inst === 'beq' ? 'bg-orange-600 shadow-orange-500/30'
                         : 'bg-sky-600 shadow-sky-500/30') + ' text-white border-transparent'
                      : (theme === 'dark' 
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-transparent' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm')
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
            <div className="flex flex-col gap-3 pb-8">
              <h2 className={`text-xl font-bold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
                Custom Instruction
              </h2>
              
              <input 
                type="text" 
                placeholder="e.g. addi $s0, $t1, 100" 
                value={practiceInput || ''}
                onChange={(e) => {
                  setPracticeInput(e.target.value);
                  setPracticeChecked(false); 
                }}
                className={`border rounded p-2 text-sm font-mono w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-600 text-emerald-400' : 'bg-white border-slate-300 text-emerald-600'
                }`}
              />
              
              <button 
                onClick={handleRandomize}
                className={`text-xs py-2 rounded font-semibold transition-colors ${
                  theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                Generate Random
              </button>

              <div className={`mt-4 p-3 rounded-lg text-xs shadow-inner border ${
                theme === 'dark' 
                  ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <p className="font-bold mb-1 flex items-center gap-1">Simulation Rules</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Registers hold their standard mapped value (e.g. <span className="font-mono font-bold">$s0 = 16</span>).</li>
                  <li>Memory read operations always load <span className="font-mono font-bold">2003</span>.</li>
                  <li>Unused data fields should be marked as <span className="font-mono font-bold">X</span>.</li>
                </ul>
              </div>

              <p className={`text-sm mt-4 mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                Click the wires on the diagram that would be active for this instruction.
              </p>
              
              <div className={`border p-4 rounded-lg text-sm mb-4 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                Wires Selected: <span className="font-bold text-purple-500">{userSelectedWires.length}</span>
              </div>

              {/* VERIFICATION BUTTONS */}
              {!practiceChecked ? (
                <button 
                  onClick={handleCheckAnswers}
                  className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg"
                >
                  Verify Complete Answer
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className={`p-4 rounded-lg font-bold flex flex-col gap-3 shadow-inner ${isCorrect ? 'bg-emerald-600/10 border border-emerald-500/50' : 'bg-rose-600/10 border border-rose-500/50'}`}>
                    <div className={`text-center text-lg ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isCorrect ? '🎉 Fully Correct!' : 'Verification Failed'}
                    </div>
                    
                    {!isCorrect && verificationState && (
                      <div className={`flex flex-col gap-1.5 text-xs p-3 rounded-md border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <div className="flex justify-between items-center border-b border-slate-500/30 pb-1">
                          <span className="uppercase tracking-wider opacity-70">Category</span>
                          <span className="uppercase tracking-wider opacity-70">Status</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>1. Machine Code</span> 
                          <span>{verificationState.machineCode ? '✅ Passed' : '❌ Failed'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>2. Diagram Wires</span> 
                          <span>{verificationState.wiresCorrect ? '✅ Passed' : '❌ Failed'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>3. Sidebar Fields</span> 
                          <span>{verificationState.formCorrect ? '✅ Passed' : '❌ Failed'}</span>
                        </div>
                      </div>
                    )}
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
                    className={`py-2 px-4 rounded-lg font-bold transition-all shadow-lg mt-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}