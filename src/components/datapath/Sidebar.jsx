import React, { useState } from 'react';
import { INSTRUCTION_ANSWERS } from '../../utils/instructionAnswers.js';
import { useDiagramStore } from '../../store/diagramStore';

// --- SCROLLBAR STYLES ---
const SidebarScrollbarStyles = ({ theme }) => (
  <style>{`
    .sidebar-scroll::-webkit-scrollbar {
      width: 8px;
    }
    .sidebar-scroll::-webkit-scrollbar-track {
      background: ${theme === 'dark' ? '#1e293b' : '#f1f5f9'};
      border-radius: 8px;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: ${theme === 'dark' ? '#475569' : '#94a3b8'};
      border-radius: 8px;
      border: 2px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'};
    }
    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
      background: ${theme === 'dark' ? '#64748b' : '#64748b'};
    }
  `}</style>
);
// Helper component for providing feedback on text inputs
const FeedbackInput = ({ name, value, onChange, isCorrect, correctValue, placeholder, theme }) => (
  <div className="flex flex-col gap-1 w-full">
    <input 
      type="text" 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className={`border rounded p-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono w-full transition-colors ${
        theme === 'dark' ? 'bg-slate-900 text-sky-400' : 'bg-slate-50 text-sky-600'
      } ${
        isCorrect === undefined ? (theme === 'dark' ? 'border-slate-600' : 'border-slate-300') : isCorrect ? 'border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]' : 'border-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]'
      }`}
    />
    {isCorrect === false && correctValue !== undefined && (
      <span className="text-[10px] text-rose-400 font-bold tracking-wider">Ans: {correctValue}</span>
    )}
  </div>
);

const Sidebar = ({ onClose }) => {
  const [showHint, setShowHint] = useState(false);

  const { 
    interactionMode, practiceInput, verificationState, verifyPracticeSubmission,
    currentCycle, playCycle, prevCycle, skipToCycleEnd, clearWires, 
    isAnimating, activeInstruction, answers, setAnswers, verifyAnswers, theme
  } = useDiagramStore();
  
  const instructionDetails = {
    'add': { name: 'add $s0, $s1, $s2', description: 'Meaning: $s0 = $s1 + $s2 (17 + 18 = 35)', binary: '[000000] [10001] [10010] [01000] [00000] [100000]' },
    'addi': { name: 'addi $s0, $s1, 100', description: '$s1 = 25 \nMeaning: $s0 = $s1 + 100 (25 + 100 = 125)', binary: '[001000] [10001] [10000] [0000000001100100]' },
    'lw': { name: 'lw $t0, 4($s1)', description: '$s1 = 100 \nLoad Word: Read memory address 104 into $t0 store value of 500', binary: '[100011] [10001] [01000] [0000000000000100]' },
    'sw': { name: 'sw $s0, 4($s2)', description: '$s0 = 500, $s2 = 200 \nStore Word: Write $s0 into memory address 204', binary: '[101011] [10010] [10000] [0000000000000100]' },
    'beq': { name: 'beq $s1, $s0, L1', description: 'Branch if $s1 (42) == $s0 (42), go to L1. Branch taken.', binary: '[000100] [10001] [10000] [0000000000000011]' }
  };

  const displayData = instructionDetails[activeInstruction] || instructionDetails['add'];

  const correctAnswers = interactionMode === 'practice_click' && verificationState
    ? { 
        signals: verificationState.correctSignals || {}, 
        dataValues: verificationState.correctDataValues || {} 
      }
    : INSTRUCTION_ANSWERS[activeInstruction] || INSTRUCTION_ANSWERS['add'];

  const handleUnitToggle = (unit) => setAnswers({ ...answers, functionalUnits: { ...answers.functionalUnits, [unit]: !answers.functionalUnits[unit] } });
  const handleDataChange = (e) => setAnswers({ ...answers, dataValues: { ...answers.dataValues, [e.target.name]: e.target.value } });
  const handleSignalChange = (e) => setAnswers({ ...answers, signals: { ...answers.signals, [e.target.name]: e.target.value } });

  const handleVerify = () => {
    if (interactionMode === 'practice_click') {
      verifyPracticeSubmission();
    } else {
      verifyAnswers();
    }
  };

  const handleReset = () => clearWires();

  const controlSignals = ['RegDst', 'ALUSrc', 'MemToReg', 'RegWrite', 'MemRead', 'MemWrite', 'Branch', 'ALUOp1', 'ALUOp0'];

  const dataGroups = {
    'Registers': [
      { key: 'reg_read1', label: 'Read register 1' }, { key: 'reg_read2', label: 'Read register 2' },
      { key: 'reg_writeReg', label: 'Write register' }, { key: 'reg_writeData', label: 'Write data' }
    ],
    'ALU': [
      { key: 'alu_oprd1', label: 'oprd 1' }, { key: 'alu_oprd2', label: 'oprd 2' },
      { key: 'alu_result', label: 'ALU Result' }, { key: 'alu_zero', label: 'Zero' }
    ],
    'Data Memory': [
      { key: 'mem_address', label: 'Address' }, { key: 'mem_writeData', label: 'Write data' }, { key: 'mem_readData', label: 'Read data' }
    ]
  };  
    

  return (
<> 
    
    <SidebarScrollbarStyles theme={theme} />

    {/* Swapped custom-scrollbar for sidebar-scroll to match the CSS */}
    <div className={`w-80 h-screen flex flex-col overflow-y-auto sidebar-scroll ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>      
      <div className="flex justify-end p-2 lg:hidden shrink-0 border-b border-slate-200 dark:border-slate-700">
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
      
      {/* INSTRUCTION DISPLAY */}
      {interactionMode === 'explore' ? (
        <div className={`rounded-lg p-4 border shrink-0 transition-all ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Instruction</div>
          <div className="flex flex-col gap-1 mb-2">
            <span className={`text-2xl font-bold font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{displayData.name}</span>
            <span className={`text-xs font-semibold whitespace-pre-line ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{displayData.description}</span>
          </div>
          <button onClick={() => setShowHint(!showHint)} className={`text-xs underline mt-1 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            {showHint ? 'Hide Binary Breakdown' : 'Show Binary Breakdown'}
          </button>
          {showHint && (
            <div className={`mt-2 p-2 rounded font-mono text-xs text-center border break-all ${
              theme === 'dark' ? 'bg-slate-950 text-emerald-400 border-slate-700' : 'bg-slate-100 text-emerald-700 border-slate-200'
            }`}>
              {displayData.binary}
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-lg p-4 border shrink-0 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] ${
          theme === 'dark' ? 'bg-slate-800 border-purple-500/50' : 'bg-white border-purple-300'
        }`}>
          <div className={`text-xs uppercase tracking-wider mb-1 font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Target Practice Instruction</div>
          <div className={`text-xl font-bold font-mono mb-2 break-words ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {practiceInput || "[Awaiting Instruction]"}
          </div>
          <p className={`text-[11px] leading-tight ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Fill out the active data paths below using the standard MIPS register values.</p>
        </div>
      )}

      {/* PLAYBACK CONTROLS */}
      {interactionMode === 'explore' && (
        <div className={`rounded-lg p-4 border shrink-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
          <h3 className={`text-sm font-semibold mb-3 border-b pb-2 flex justify-between items-center ${theme === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'}`}>
            <span>Step-by-Step Execution</span>
            {isAnimating && <span className="text-emerald-500 text-xs animate-pulse">Animating...</span>}
          </h3>
          <div className={`flex items-center justify-between rounded p-2 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <button 
              onClick={prevCycle} disabled={currentCycle === 0 || isAnimating}
              className={`px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-bold ${
                theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              ◀ Prev
            </button>
            <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {currentCycle === 0 ? 'Ready' : `Cycle ${currentCycle} / 4`}
            </span>
            {currentCycle >= 4 && !isAnimating ? (
              <button onClick={handleReset} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all">
                Reset ↺
              </button>
            ) : (
              <button 
                onClick={isAnimating ? skipToCycleEnd : playCycle}
                className={`px-3 py-1 rounded text-xs font-bold transition-all shadow-md ${
                  isAnimating ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {isAnimating ? 'Skip ⏭' : 'Next ▶'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Functional Units */}
      <div className={`rounded-lg p-4 border shrink-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
        <h3 className={`text-sm font-semibold mb-3 border-b pb-2 ${theme === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'}`}>
          1. Active Functional Units
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(answers.functionalUnits).map((unit) => {
             const isCorrect = verificationState?.functionalUnits?.[unit];
             const labelColor = isCorrect === undefined 
               ? (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900') 
               : isCorrect ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold';
             
             return (
              <label key={unit} className={`flex items-center gap-2 text-xs cursor-pointer transition-colors ${labelColor}`}>
                <input 
                  type="checkbox" checked={answers.functionalUnits[unit]} onChange={() => handleUnitToggle(unit)} 
                  className={`rounded focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'} ${isCorrect === false ? 'accent-rose-500' : 'accent-blue-500'}`}
                />
                {unit}
              </label>
             );
          })}
        </div>
      </div>

      {/* 2. Data Values */}
      <div className={`rounded-lg p-4 border shrink-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
        <h3 className={`text-sm font-semibold mb-4 border-b pb-2 ${theme === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'}`}>
          2. Data Values (Inputs/Outputs)
        </h3>
        <div className="flex flex-col gap-5">
          {Object.entries(dataGroups).map(([groupName, fields]) => (
            <div key={groupName}>
              <h4 className={`text-[11px] font-bold mb-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{groupName}</h4>
              <div className="grid grid-cols-2 gap-3">
                {fields.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1 w-full">
                    <label className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
                    <FeedbackInput 
                      name={key} 
                      value={answers.dataValues[key]} 
                      onChange={handleDataChange} 
                      placeholder="..."
                      isCorrect={verificationState?.dataValues?.[key]}
                      correctValue={correctAnswers?.dataValues?.[key]}
                      theme={theme}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Control Signals */}
      <div className={`rounded-lg p-4 border shrink-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
        <h3 className={`text-sm font-semibold mb-3 border-b pb-2 ${theme === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'}`}>
          3. Control Signals
        </h3>
        <div className="grid grid-cols-3 gap-x-2 gap-y-3">
          {controlSignals.map((signal) => {
             const isCorrect = verificationState?.signals?.[signal];
             let borderClass = theme === 'dark' ? 'border-slate-600' : 'border-slate-300';
             if (isCorrect !== undefined) {
               borderClass = isCorrect ? 'border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]' : 'border-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]';
             }

             return (
              <div key={signal} className="flex flex-col gap-1">
                <label className={`text-[10px] truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} title={signal}>{signal}</label>
                <select 
                  name={signal} value={answers.signals[signal]} onChange={handleSignalChange} 
                  className={`border ${borderClass} rounded p-1 text-xs focus:outline-none focus:border-blue-500 font-mono transition-colors ${
                    theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'
                  }`}
                >
                  <option value="">-</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="X">X</option>
                </select>
                {isCorrect === false && correctAnswers?.signals && (
                  <span className="text-[10px] text-rose-500 font-bold">Ans: {correctAnswers.signals[signal]}</span>
                )}
              </div>
             );
          })}
        </div>
      </div>

      <div className="pt-2 pb-4 mt-auto shrink-0">
        <button 
          onClick={handleVerify}
          className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg ${
            interactionMode === 'practice_click'
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
          }`}
        >
          {interactionMode === 'practice_click' ? 'Verify Sidebar Fields' : 'Verify All Answers'}
        </button>
      </div>

    </div>
    </>
  );
};

export default Sidebar;