import React, { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';

// Helper component for providing feedback on text inputs
const FeedbackInput = ({ name, value, onChange, isCorrect, correctValue, placeholder }) => (
  <div className="flex flex-col gap-1 w-full">
    <input 
      type="text" 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className={`bg-slate-900 border text-sky-400 rounded p-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono w-full transition-colors ${
        isCorrect === undefined ? 'border-slate-600' : isCorrect ? 'border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]' : 'border-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]'
      }`}
    />
    {isCorrect === false && correctValue !== undefined && (
      <span className="text-[10px] text-rose-400 font-bold tracking-wider">Ans: {correctValue}</span>
    )}
  </div>
);

const Sidebar = () => {
  const [showHint, setShowHint] = useState(false);

  // 👉 THIS IS THE FIX: We pull all required states out of the store here!
  const { 
    interactionMode, practiceInput, verificationState, verifyPracticeSubmission,
    currentCycle, playCycle, prevCycle, skipToCycleEnd, clearWires, 
    isAnimating, activeInstruction, answers, setAnswers, verifyAnswers
  } = useDiagramStore();
  
  const INSTRUCTION_ANSWERS = {
    'add': {
      functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: false, SignExtend: false },
      dataValues: { reg_read1: '17', reg_read2: '18', reg_writeReg: '8', reg_writeData: '35', alu_oprd1: '17', alu_oprd2: '18', alu_result: '35', alu_zero: '0', mem_address: '35', mem_writeData: '18', mem_readData: 'N/A' },
      signals: { RegDst: '1', ALUSrc: '0', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '1', ALUOp0: '0' }
    },
    'addi': {
      functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: false, SignExtend: true },
      dataValues: { reg_read1: '25', reg_read2: 'N/A', reg_writeReg: '16', reg_writeData: '125', alu_oprd1: '25', alu_oprd2: '100', alu_result: '125', alu_zero: '0', mem_address: '125', mem_writeData: 'N/A', mem_readData: 'N/A' },
      signals: { RegDst: '0', ALUSrc: '1', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '0', ALUOp0: '0' }
    },
    'lw': {
      functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: true, SignExtend: true },
      dataValues: { reg_read1: '100', reg_read2: 'N/A', reg_writeReg: '8', reg_writeData: '500', alu_oprd1: '100', alu_oprd2: '4', alu_result: '104', alu_zero: '0', mem_address: '104', mem_writeData: 'N/A', mem_readData: '500' },
      signals: { RegDst: '0', ALUSrc: '1', MemToReg: '1', RegWrite: '1', MemRead: '1', MemWrite: '0', Branch: '0', ALUOp1: '0', ALUOp0: '0' }
    },
    'sw': {
      functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: true, SignExtend: true },
      dataValues: { reg_read1: '200', reg_read2: '500', reg_writeReg: 'X', reg_writeData: 'X', alu_oprd1: '200', alu_oprd2: '4', alu_result: '204', alu_zero: '0', mem_address: '204', mem_writeData: '500', mem_readData: 'N/A' },
      signals: { RegDst: 'X', ALUSrc: '1', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '1', Branch: '0', ALUOp1: '0', ALUOp0: '0' }
    },
    'beq': {
      functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: false, SignExtend: true },
      dataValues: { reg_read1: '42', reg_read2: '42', reg_writeReg: 'X', reg_writeData: 'X', alu_oprd1: '42', alu_oprd2: '42', alu_result: '0', alu_zero: '1', mem_address: 'X', mem_writeData: 'X', mem_readData: 'X' },
      signals: { RegDst: 'X', ALUSrc: '0', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '0', Branch: '1', ALUOp1: '0', ALUOp0: '1' }
    }
  };

  const instructionDetails = {
    'add': { name: 'add $s0, $s1, $s2', description: 'Meaning: $s0 = $s1 + $s2 (17 + 18 = 35)', binary: '[000000] [10001] [10010] [01000] [00000] [100000]' },
    'addi': { name: 'addi $s0, $s1, 100', description: '$s1 = 25 \nMeaning: $s0 = $s1 + 100 (25 + 100 = 125)', binary: '[001000] [10001] [10000] [0000000001100100]' },
    'lw': { name: 'lw $t0, 4($s1)', description: '$s1 = 100 \nLoad Word: Read memory address 104 into $t0 store value of 500', binary: '[100011] [10001] [01000] [0000000000000100]' },
    'sw': { name: 'sw $s0, 4($s2)', description: '$s0 = 500, $s2 = 200 \nStore Word: Write $s0 into memory address 204', binary: '[101011] [10010] [10000] [0000000000000100]' },
    'beq': { name: 'beq $s1, $s0, L1', description: 'Branch if $s1 (42) == $s0 (42), go to L1. Branch taken.', binary: '[000100] [10001] [10000] [0000000000000011]' }
  };

  const displayData = instructionDetails[activeInstruction] || instructionDetails['add'];

  // In Practice Mode, read the dynamically calculated ground truth. In Explore mode, use hardcoded.
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
    <div className="w-80 h-full bg-slate-900 border-l border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto text-slate-200">
      
      {/* INSTRUCTION DISPLAY (Conditional based on mode) */}
      {interactionMode === 'explore' ? (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shrink-0 transition-all">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Instruction</div>
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-2xl font-bold font-mono text-blue-400">{displayData.name}</span>
            <span className="text-xs text-slate-300 font-semibold whitespace-pre-line">{displayData.description}</span>
          </div>
          <button onClick={() => setShowHint(!showHint)} className="text-xs text-blue-400 hover:text-blue-300 underline mt-1">
            {showHint ? 'Hide Binary Breakdown' : 'Show Binary Breakdown'}
          </button>
          {showHint && (
            <div className="mt-2 p-2 bg-slate-950 rounded font-mono text-xs text-center text-emerald-400 border border-slate-700 break-all">
              {displayData.binary}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] shrink-0 transition-all">
          <div className="text-xs text-purple-400 uppercase tracking-wider mb-1 font-bold">Target Practice Instruction</div>
          <div className="text-xl font-bold font-mono text-white mb-2 break-words">
            {practiceInput || "[ Awaiting Instruction ]"}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">Fill out the active data paths below using the standard MIPS register values.</p>
        </div>
      )}

      {/* PLAYBACK CONTROLS (Explore Mode Only) */}
      {interactionMode === 'explore' && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shrink-0">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
            <span>Step-by-Step Execution</span>
            {isAnimating && <span className="text-emerald-400 text-xs animate-pulse">Animating...</span>}
          </h3>
          <div className="flex items-center justify-between bg-slate-900 rounded p-2 border border-slate-700">
            <button 
              onClick={prevCycle} disabled={currentCycle === 0 || isAnimating}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-bold"
            >
              ◀ Prev
            </button>
            <span className="text-xs font-mono font-bold text-blue-400">
              {currentCycle === 0 ? 'Ready' : `Cycle ${currentCycle} / 4`}
            </span>
            {currentCycle >= 4 && !isAnimating ? (
              <button onClick={handleReset} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-xs font-bold transition-all">
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
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shrink-0">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">
          1. Active Functional Units
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(answers.functionalUnits).map((unit) => {
             const isCorrect = verificationState?.functionalUnits?.[unit];
             const labelColor = isCorrect === undefined ? 'text-slate-400' : isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
             
             return (
              <label key={unit} className={`flex items-center gap-2 text-xs cursor-pointer hover:text-white ${labelColor}`}>
                <input 
                  type="checkbox" checked={answers.functionalUnits[unit]} onChange={() => handleUnitToggle(unit)} 
                  className={`rounded border-slate-600 bg-slate-700 focus:ring-blue-500 ${isCorrect === false ? 'accent-rose-500' : 'accent-blue-500'}`}
                />
                {unit}
              </label>
             );
          })}
        </div>
      </div>

      {/* 2. Data Values */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shrink-0">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">
          2. Data Values (Inputs/Outputs)
        </h3>
        <div className="flex flex-col gap-5">
          {Object.entries(dataGroups).map(([groupName, fields]) => (
            <div key={groupName}>
              <h4 className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{groupName}</h4>
              <div className="grid grid-cols-2 gap-3">
                {fields.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] text-slate-400">{label}</label>
                    <FeedbackInput 
                      name={key} 
                      value={answers.dataValues[key]} 
                      onChange={handleDataChange} 
                      placeholder="..."
                      isCorrect={verificationState?.dataValues?.[key]}
                      correctValue={correctAnswers?.dataValues?.[key]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Control Signals */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shrink-0">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">
          3. Control Signals
        </h3>
        <div className="grid grid-cols-3 gap-x-2 gap-y-3">
          {controlSignals.map((signal) => {
             const isCorrect = verificationState?.signals?.[signal];
             let borderClass = 'border-slate-600';
             if (isCorrect !== undefined) {
               borderClass = isCorrect ? 'border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]' : 'border-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]';
             }

             return (
              <div key={signal} className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 truncate" title={signal}>{signal}</label>
                <select 
                  name={signal} value={answers.signals[signal]} onChange={handleSignalChange} 
                  className={`bg-slate-700 border ${borderClass} text-white rounded p-1 text-xs focus:outline-none focus:border-blue-500 font-mono`}
                >
                  <option value="">-</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="X">X</option>
                </select>
                {isCorrect === false && correctAnswers?.signals && (
                  <span className="text-[10px] text-rose-400 font-bold">Ans: {correctAnswers.signals[signal]}</span>
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
  );
};

export default Sidebar;