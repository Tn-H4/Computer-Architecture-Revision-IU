import React, { useState, useEffect } from 'react';
import Xarrow, { Xwrapper } from 'react-xarrows'; 
import { useDiagramStore } from '../store/diagramStore';

const XarrowComponent = Xarrow.default || Xarrow;

// --- MATH LOGIC ENGINE: COMPUTES ANSWERS FOR STALL & FORWARDING MODES ---
const generateMipsProblem = () => {
  const opcodes = ['add', 'sub', 'and', 'or', 'lw', 'sw'];
  const registers = ['$t1', '$t2', '$t3', '$t4', '$t5'];
  const length = Math.floor(Math.random() * 4) + 4; 

  let instructions = [];
  let parsedInstructions = [];

  for (let i = 0; i < length; i++) {
    const op = opcodes[Math.floor(Math.random() * opcodes.length)];
    const dest = registers[Math.floor(Math.random() * registers.length)];
    const src1 = registers[Math.floor(Math.random() * registers.length)];
    const src2 = registers[Math.floor(Math.random() * registers.length)];
    const offset = Math.floor(Math.random() * 20) * 4;

    let instString = '';
    let reads = [], writes = [];

    if (op === 'lw') {
      instString = `${op} ${dest}, ${offset}(${src1})`;
      reads = [src1]; writes = [dest];
    } else if (op === 'sw') {
      instString = `${op} ${dest}, ${offset}(${src1})`;
      reads = [dest, src1]; writes = [];
    } else {
      instString = `${op} ${dest}, ${src1}, ${src2}`;
      reads = [src1, src2]; writes = [dest];
    }

    instructions.push(`${i + 1}: ${instString}`);
    parsedInstructions.push({ index: i + 1, op, src1, src2, dest, reads, writes });
  }

  // --- 1. STALL-ONLY MATH ENGINE ---
  let stallHazards = [];
  let totalStallsOnly = 0;
  let regReadyCycleStall = {}; 
  let currentIssueStall = 1; 
  let stallSolutionGrid = Array(length).fill(null).map(() => []);

  for (let i = 0; i < parsedInstructions.length; i++) {
    const inst = parsedInstructions[i];
    let baseIM = currentIssueStall;
    let baseID = baseIM + 1;
    let reqID = baseID;

    inst.reads.forEach(reg => {
      if (regReadyCycleStall[reg] && regReadyCycleStall[reg] > reqID) {
        reqID = regReadyCycleStall[reg];
        let srcIdx = parsedInstructions.find(p => p.writes.includes(reg) && p.index < inst.index)?.index;
        if (srcIdx && !stallHazards.includes(`(${srcIdx})-(${inst.index})`)) {
          stallHazards.push(`(${srcIdx})-(${inst.index})`);
        }
      }
    });

    let s = reqID - baseID;
    totalStallsOnly += s;
    currentIssueStall = (baseIM + s) + 1;

    for(let c = 0; c < baseIM - 1; c++) stallSolutionGrid[i].push(null);
    for(let j = 0; j < s; j++) stallSolutionGrid[i].push('Stall');
    stallSolutionGrid[i].push('IM', 'Reg1', 'ALU', 'DM', 'Reg2');

    if (inst.writes.length > 0) {
      inst.writes.forEach(reg => { regReadyCycleStall[reg] = reqID + 3; });
    }
  }
  const maxCyclesStall = Math.max(...stallSolutionGrid.map(r => r.length));

  // --- 2. ADVANCED FORWARDING & MULTIPLEXER MATH ENGINE ---
  let fwdHazards = [];
  let solutionFwdPaths = []; 
  let remainingStalls = 0;
  let firstMuxAnswer = "ForwardA=00, ForwardB=00";
  let muxFound = false;
  let fwdSolutionGrid = Array(length).fill(null).map(() => []);
  
  let currentIssueFwd = 1;

  for (let i = 0; i < parsedInstructions.length; i++) {
    const inst = parsedInstructions[i];
    let baseIM = currentIssueFwd;
    let baseID = baseIM + 1;
    
    let needsLoadStall = false;
    let loadUseFwdA = false;
    let loadUseFwdB = false;

    if (i > 0 && parsedInstructions[i-1].op === 'lw') {
      const priorDest = parsedInstructions[i-1].dest;
      if (inst.op !== 'lw' && inst.op !== 'sw') {
        if (inst.src1 === priorDest) loadUseFwdA = true;
        if (inst.src2 === priorDest) loadUseFwdB = true;
      } else if (inst.op === 'sw') {
        if (inst.src1 === priorDest) loadUseFwdA = true; 
        if (inst.dest === priorDest) loadUseFwdB = true; 
      } else if (inst.op === 'lw') {
        if (inst.src1 === priorDest) loadUseFwdA = true; 
      }
      if (loadUseFwdA || loadUseFwdB) needsLoadStall = true;
    }

    let s = needsLoadStall ? 1 : 0;
    remainingStalls += s;
    
    let actIM = baseIM + s;
    currentIssueFwd = actIM + 1;

    for(let c = 0; c < baseIM - 1; c++) fwdSolutionGrid[i].push(null);
    for(let j = 0; j < s; j++) fwdSolutionGrid[i].push('Stall');
    fwdSolutionGrid[i].push('IM', 'Reg1', 'ALU', 'DM', 'Reg2');

    let fA = "00", fB = "00";
    
    if (i > 0) {
      const prev1 = parsedInstructions[i-1];
      if (prev1.writes.length > 0 && prev1.dest !== '$zero') {
        if (prev1.op === 'lw') {
           if (loadUseFwdA) { fA = "01"; fwdHazards.push(`(${prev1.index})-(${inst.index})`); solutionFwdPaths.push({from: {row: i-1, stage: 'DM'}, to: {row: i, stage: 'ALU'}}); }
           if (loadUseFwdB) { fB = "01"; fwdHazards.push(`(${prev1.index})-(${inst.index})`); solutionFwdPaths.push({from: {row: i-1, stage: 'DM'}, to: {row: i, stage: 'ALU'}}); }
        } else {
           let matchedA = false, matchedB = false;
           if (inst.op !== 'lw' && inst.op !== 'sw') {
             if (prev1.dest === inst.src1) { fA = "10"; matchedA = true; }
             if (prev1.dest === inst.src2) { fB = "10"; matchedB = true; }
           } else if (inst.op === 'sw') {
             if (prev1.dest === inst.src1) { fA = "10"; matchedA = true; }
             if (prev1.dest === inst.dest) { fB = "10"; matchedB = true; }
           } else if (inst.op === 'lw') {
             if (prev1.dest === inst.src1) { fA = "10"; matchedA = true; }
           }
           if (matchedA || matchedB) {
               fwdHazards.push(`(${prev1.index})-(${inst.index})`);
               solutionFwdPaths.push({from: {row: i-1, stage: 'ALU'}, to: {row: i, stage: 'ALU'}});
           }
        }
      }
    }
    
    if (i > 1) {
      const prev2 = parsedInstructions[i-2];
      if (prev2.writes.length > 0 && prev2.dest !== '$zero') {
         let matchedA = false, matchedB = false;
         if (inst.op !== 'lw' && inst.op !== 'sw') {
           if (prev2.dest === inst.src1 && fA === "00") { fA = "01"; matchedA = true; }
           if (prev2.dest === inst.src2 && fB === "00") { fB = "01"; matchedB = true; }
         } else if (inst.op === 'sw') {
           if (prev2.dest === inst.src1 && fA === "00") { fA = "01"; matchedA = true; }
           if (prev2.dest === inst.dest && fB === "00") { fB = "01"; matchedB = true; }
         } else if (inst.op === 'lw') {
           if (prev2.dest === inst.src1 && fA === "00") { fA = "01"; matchedA = true; }
         }
         if (matchedA || matchedB) {
            fwdHazards.push(`(${prev2.index})-(${inst.index})`);
            solutionFwdPaths.push({from: {row: i-2, stage: 'DM'}, to: {row: i, stage: 'ALU'}});
         }
      }
    }

    if (!muxFound && (fA !== "00" || fB !== "00")) {
      firstMuxAnswer = `ForwardA=${fA}, ForwardB=${fB}`;
      muxFound = true;
    }
  }
  
  fwdHazards = [...new Set(fwdHazards)];
  const maxCyclesFwd = Math.max(...fwdSolutionGrid.map(r => r.length));

  return {
    instructions,
    stallSolutionGrid,
    fwdSolutionGrid,
    solutionFwdPaths, 
    stallAnswers: {
      hazards: stallHazards.join(', ') || 'None',
      stalls: totalStallsOnly.toString(),
      cycles: maxCyclesStall.toString()
    },
    fwdAnswers: {
      hazards: fwdHazards.join(', ') || 'None',
      mux: firstMuxAnswer,
      stalls: remainingStalls.toString(),
      cycles: maxCyclesFwd.toString()
    }
  };
};

const getMiniGridStyle = (cell) => {
  switch(cell) {
    case 'IM': return 'bg-blue-500 text-white border-blue-600';
    case 'Reg1': return 'bg-green-500 text-white border-green-600';
    case 'ALU': return 'bg-rose-500 text-white border-rose-600';
    case 'DM': return 'bg-purple-500 text-white border-purple-600';
    case 'Reg2': return 'bg-teal-500 text-white border-teal-600';
    case 'Stall': return 'bg-transparent text-slate-500 border border-dashed border-slate-400';
    default: return 'bg-transparent border-transparent';
  }
};

// --- SIDEBAR ARCHITECTURE ---
const HazardSidebar = ({ setGridInstructions, userGrid, onClose, exerciseMode = 'stall' }) => {
  const { theme } = useDiagramStore();
  
  const [problem, setProblem] = useState(generateMipsProblem);
  const [userAnswers, setUserAnswers] = useState({ hazards: '', stalls: '', cycles: '', mux: '' });
  const [feedback, setFeedback] = useState(null);
  const [showSolution, setShowSolution] = useState(false); 
  const [showMuxRef, setShowMuxRef] = useState(false);

  useEffect(() => {
    if (setGridInstructions && problem) {
      setGridInstructions(problem.instructions.map(inst => inst.split(': ')[1]));
    }
  }, [problem, setGridInstructions]);

  useEffect(() => {
    setUserAnswers({ hazards: '', stalls: '', cycles: '', mux: '' });
    setFeedback(null);
    setShowSolution(false);
    setShowMuxRef(false); 
  }, [exerciseMode]);

  const handleGenerateNew = () => {
    setProblem(generateMipsProblem());
    setUserAnswers({ hazards: '', stalls: '', cycles: '', mux: '' });
    setFeedback(null);
    setShowSolution(false);
  };

  const handleVerify = () => {
    setShowSolution(true);
    const activeAnswers = exerciseMode === 'stall' ? problem.stallAnswers : problem.fwdAnswers;

    const isHazardsCorrect = userAnswers.hazards.trim().toLowerCase() === activeAnswers.hazards.toLowerCase();
    const isStallsCorrect = userAnswers.stalls.trim() === activeAnswers.stalls;
    const isCyclesCorrect = userAnswers.cycles.trim() === activeAnswers.cycles;
    
    const isMuxCorrect = exerciseMode === 'stall' 
      ? true 
      : userAnswers.mux.trim().replace(/\s+/g, '').toLowerCase() === activeAnswers.mux.replace(/\s+/g, '').toLowerCase();

    const targetedGridSolution = exerciseMode === 'stall' ? problem.stallSolutionGrid : problem.fwdSolutionGrid;
    let isGridCorrect = true;
    let firstErrorRow = -1;

    for (let r = 0; r < targetedGridSolution.length; r++) {
      const solutionRow = targetedGridSolution[r];
      const userRow = userGrid[r] || [];

      for (let c = 0; c < Math.max(solutionRow.length, 20); c++) {
        const expectedCell = solutionRow[c] || null;
        const actualCell = userRow[c] || null;

        if (expectedCell !== actualCell) {
          isGridCorrect = false;
          firstErrorRow = r + 1;
          break;
        }
      }
      if (!isGridCorrect) break;
    }

    if (isHazardsCorrect && isStallsCorrect && isCyclesCorrect && isMuxCorrect && isGridCorrect) {
      setFeedback({ type: 'success', message: 'Outstanding! The configurations and pipeline matrix are perfectly accurate.' });
    } else if (isHazardsCorrect && isStallsCorrect && isCyclesCorrect && isMuxCorrect && !isGridCorrect) {
      setFeedback({ type: 'error', message: `Hardware equations are right, but the drag-and-drop grid is wrong starting at Instruction ${firstErrorRow}.` });
    } else {
      setFeedback({ type: 'error', message: 'Some metrics are incorrect. Study the solution breakdown down below!' });
    }
  };

  // --- DYNAMIC THEMING VARIABLES ---
  const bgTheme = theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100';
  const textTheme = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const borderTheme = theme === 'dark' ? 'border-slate-700' : 'border-slate-300';
  const inputBg = theme === 'dark' ? 'bg-slate-900 border-slate-600 focus:border-blue-500' : 'bg-white border-slate-300 focus:border-blue-400';

  const currentKey = exerciseMode === 'stall' ? problem.stallAnswers : problem.fwdAnswers;
  const currentMatrix = exerciseMode === 'stall' ? problem.stallSolutionGrid : problem.fwdSolutionGrid;

  return (
    <div className={`w-full h-full flex flex-col border-l shrink-0 overflow-y-auto overflow-x-hidden ${bgTheme} ${borderTheme} shadow-xl z-50 relative`}>
      <div className={`p-4 border-b font-bold text-lg tracking-wide flex justify-between items-center ${borderTheme} ${textTheme}`}>
        <span>Chapter 4.2</span>
        <span className="text-xs uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          {exerciseMode} mode
        </span>
      </div>

      <div className="flex justify-between items-center p-2 lg:hidden shrink-0 border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider ml-2 text-slate-400">
          Hazard Menu
        </span>
        <button 
          onClick={onClose} 
          className="px-3 py-1.5 text-sm font-bold rounded-md transition-colors bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
        >
          ✕ Close
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className={`text-sm font-semibold ${textTheme}`}>
              {exerciseMode === 'stall' ? '1. Where is the data hazard?' : '1. Where is forwarding required?'}
            </label>
            <span className={`text-xs mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Format: (1)-(2), (2)-(3) or "None"
            </span>
            <input 
              type="text" 
              value={userAnswers.hazards}
              onChange={(e) => setUserAnswers({...userAnswers, hazards: e.target.value})}
              className={`p-2 rounded outline-none border transition-colors font-mono text-sm ${inputBg} ${textTheme}`}
              placeholder="e.g. (1)-(3)"
              disabled={showSolution}
            />
          </div>

          {exerciseMode === 'forwarding' && (
            <div className="flex flex-col gap-1 animate-in fade-in duration-200">
              <div className="flex justify-between items-end">
                <label className={`text-sm font-semibold ${textTheme}`}>2. Mux values for the first hazard?</label>
                <button 
                  onClick={() => setShowMuxRef(!showMuxRef)}
                  className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    theme === 'dark' 
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Ref
                </button>
              </div>
              <span className={`text-xs mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Format exactly: ForwardA=XX, ForwardB=XX
              </span>

              {showMuxRef && (
                <div className={`mb-3 p-3 rounded-lg border text-xs shadow-inner ${
                  theme === 'dark' ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}>
                  <div className={`font-bold mb-2 pb-1 border-b ${theme === 'dark' ? 'border-slate-500/30' : 'border-slate-300'}`}>Mux Values (F1 / F2)</div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="opacity-70">
                        <th className="py-1 font-semibold">Binary</th>
                        <th className="py-1 font-semibold">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`border-t ${theme === 'dark' ? 'border-slate-500/20' : 'border-slate-300'}`}>
                        <td className={`py-1.5 font-mono font-bold ${theme === 'dark' ? 'text-cyan-500' : 'text-blue-600'}`}>00</td>
                        <td className="py-1.5">ID/EX <span className="opacity-60">(Default)</span></td>
                      </tr>
                      <tr className={`border-t ${theme === 'dark' ? 'border-slate-500/20' : 'border-slate-300'}`}>
                        <td className={`py-1.5 font-mono font-bold ${theme === 'dark' ? 'text-cyan-500' : 'text-blue-600'}`}>10</td>
                        <td className="py-1.5">EX/MEM <span className="opacity-60">(Prior Inst)</span></td>
                      </tr>
                      <tr className={`border-t ${theme === 'dark' ? 'border-slate-500/20' : 'border-slate-300'}`}>
                        <td className={`py-1.5 font-mono font-bold ${theme === 'dark' ? 'text-cyan-500' : 'text-blue-600'}`}>01</td>
                        <td className="py-1.5">MEM/WB <span className="opacity-60">(2 Inst Back)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <input 
                type="text" 
                value={userAnswers.mux}
                onChange={(e) => setUserAnswers({...userAnswers, mux: e.target.value})}
                className={`p-2 rounded outline-none border transition-colors font-mono text-sm ${inputBg} ${textTheme}`}
                placeholder="ForwardA=10, ForwardB=00"
                disabled={showSolution}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className={`text-sm font-semibold ${textTheme}`}>
              {exerciseMode === 'stall' ? '2. How many stalls used?' : '3. Remaining stalls needed?'}
            </label>
            <input 
              type="number" 
              value={userAnswers.stalls}
              onChange={(e) => setUserAnswers({...userAnswers, stalls: e.target.value})}
              className={`p-2 rounded outline-none border transition-colors ${inputBg} ${textTheme}`}
              disabled={showSolution}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={`text-sm font-semibold ${textTheme}`}>
              {exerciseMode === 'stall' ? '3. How many cycles needed?' : '4. Total cycles needed?'}
            </label>
            <input 
              type="number" 
              value={userAnswers.cycles}
              onChange={(e) => setUserAnswers({...userAnswers, cycles: e.target.value})}
              className={`p-2 rounded outline-none border transition-colors ${inputBg} ${textTheme}`}
              disabled={showSolution}
            />
          </div>
        </div>

        {feedback && (
          <div className={`p-3 rounded-md text-sm font-medium border ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-500' 
              : 'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-500'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* --- DYNAMIC SOLUTION PRESENTATION MODULE --- */}
        {showSolution && (
          <div className={`p-4 rounded-xl border flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
          }`}>
            <h3 className={`font-bold text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}`}>
              Answer Guide ({exerciseMode})
            </h3>
            
            <div className={`text-xs grid grid-cols-1 gap-2 font-mono ${textTheme}`}>
              <div><span className={`opacity-60 text-[10px] block font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>HAZARDS:</span> {currentKey.hazards}</div>
              {exerciseMode === 'forwarding' && (
                <div className={`font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`}>
                  <span className={`opacity-60 text-[10px] block font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>FIRST HAZARD MUX SELECTORS:</span> {currentKey.mux}
                </div>
              )}
              <div><span className={`opacity-60 text-[10px] block font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>STALL COUNT:</span> {currentKey.stalls}</div>
              <div><span className={`opacity-60 text-[10px] block font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>TOTAL VIEWPORT CYCLES:</span> {currentKey.cycles}</div>
            </div>

            <div className={`pt-3 border-t overflow-x-auto pb-6 relative min-h-[150px] ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <span className="opacity-60 text-xs block mb-2">Target Matrix Layout:</span>
              
              {/* MINI XWRAPPER FOR ARROWS */}
              <Xwrapper>
                {exerciseMode === 'forwarding' && problem.solutionFwdPaths.map((path, idx) => {
                  const fromCol = currentMatrix[path.from.row].lastIndexOf(path.from.stage);
                  const toCol = currentMatrix[path.to.row].indexOf(path.to.stage);

                  if (fromCol !== -1 && toCol !== -1) {
                     return (
                       <XarrowComponent
                         key={idx}
                         start={`mini-pipe-${path.from.row}-${fromCol}`}
                         end={`mini-block-${path.to.row}-${toCol}`}
                         color={theme === 'dark' ? '#22d3ee' : '#2563eb'}
                         strokeWidth={1.5}
                         path="smooth"
                         headSize={4}
                         startAnchor={{ position: "bottom", offset: { x: 0 } }}
                         endAnchor={{ position: "top", offset: { x: -6 } }} 
                         zIndex={20}
                       />
                     );
                  }
                  return null;
                })}

                <div className="flex flex-col gap-1 w-fit">
                  {currentMatrix.map((row, i) => (
                    <div key={i} className="flex gap-1 items-center">
                      <span className={`w-4 text-xs font-mono font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}</span>
                      {row.map((cell, j) => (
                        <div 
                          key={j} 
                          id={`mini-block-${i}-${j}`}
                          className={`relative w-7 h-7 flex items-center justify-center text-[9px] font-bold rounded-sm border shrink-0 ${getMiniGridStyle(cell)}`}
                        >
                          {cell === 'Reg1' || cell === 'Reg2' ? 'Reg' : cell}
                          
                          {['IM', 'Reg1', 'ALU', 'DM'].includes(cell) && (
                            <div id={`mini-pipe-${i}-${j}`} className="absolute -right-[2px] top-0 bottom-0 w-[4px] pointer-events-none" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Xwrapper>
            </div>
          </div>
        )}

      </div>

      <div className={`p-4 border-t flex flex-col gap-3 shrink-0 ${borderTheme}`}>
        {!showSolution ? (
          <button 
            onClick={handleVerify}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow transition-colors"
          >
            Check Configuration
          </button>
        ) : (
          <button 
            onClick={handleGenerateNew}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow transition-colors"
          >
            Generate New Sequence
          </button>
        )}
      </div>
    </div>
  );
};

export default HazardSidebar;