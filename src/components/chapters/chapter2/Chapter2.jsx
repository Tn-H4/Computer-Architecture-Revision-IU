import React, { useState } from 'react';
import { useDiagramStore } from '../../../store/diagramStore';
import { generateVariables } from '../../../utils/chapter2Engine.js';
import { KeyIcon, CheckIcon, CrossIcon, DiceIcon, BookIcon } from '../../shared/WorksheetIcons';
import { getWorksheetTheme } from '../../shared/worksheetTheme';
import { checkHexValue, toHex } from '../../../utils/worksheetHelpers.js';
import RefTableModal from './RefTableModal';
import { ColoredInstruction, ColoredBinary, getFieldColors } from './ColoredFields';

// --- MAIN COMPONENT ---
export default function Chapter2() {
  const { theme } = useDiagramStore();
  const [activeTab, setActiveTab] = useState('memory');
  const [mode, setMode] = useState('practice');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vars, setVars] = useState(generateVariables());
  
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [revealed, setRevealed] = useState({});
  const [refTableOpen, setRefTableOpen] = useState(false);

  const handleRandomize = () => { 
    setVars(generateVariables()); setIsSubmitted(false); setAnswers({}); setScores({}); setRevealed({}); 
  };
  
  const handleChange = (id, val) => { 
    setAnswers(prev => ({ ...prev, [id]: val })); setIsSubmitted(false); 
  };
  
  const toggleReveal = (id) => { 
    setRevealed(prev => ({ ...prev, [id]: !prev[id] })); 
  };

  const verifyAnswers = () => {
    const checkValue = (input, target, isInst = false) => {
      if (input === undefined || input === null || input === '') return false;
      let cleanIn = input.toString().trim().toLowerCase();
      let cleanTg = target.toString().trim().toLowerCase();
      
      if (isInst) {
         cleanIn = cleanIn.replace(/[\s,]+/g, '');
         cleanTg = cleanTg.replace(/[\s,]+/g, '');
      } else if (cleanTg.startsWith('0x') || cleanIn.startsWith('0x')) {
         const numIn = parseInt(cleanIn, 16); const numTg = parseInt(cleanTg, 16);
         if (!isNaN(numIn) && !isNaN(numTg)) return numIn === numTg;
      }
      return cleanIn === cleanTg;
    };

    const TARGETS = {
      'mem_a': vars.memAns.a, 'mem_b': vars.memAns.b, 'mem_c': vars.memAns.c, 'mem_d': vars.memAns.d, 'mem_e': vars.memAns.e, 'mem_f': vars.memAns.f, 'mem_g': vars.memAns.g,
      'arr_s0': vars.arrAns.s0, 'arr_s1': vars.arrAns.s1, 'arr_s4': vars.arrAns.s4,
      'bit_a1': vars.bitAns.a1, 'bit_a2': vars.bitAns.a2, 'bit_a3': vars.bitAns.a3, 'bit_a4': vars.bitAns.a4,
      'seq_s1': vars.seqAns.s1, 'seq_s2': vars.seqAns.s2, 'seq_s3': vars.seqAns.s3,
      'mc_hex': vars.mcAns.machineCode,
    };

    // Dynamically check mc_ fields based on R or I format
    if (vars.mcAns.type === 'R') {
      ['op', 'rs', 'rt', 'rd', 'shamt', 'funct'].forEach(f => {
        TARGETS[`mc_${f}`] = vars.mcAns[f];
        TARGETS[`mc_${f}_bin`] = (vars.mcAns[f] >>> 0).toString(2).padStart(f === 'op' || f === 'funct' ? 6 : 5, '0');
      });
    } else {
      ['op', 'rs', 'rt'].forEach(f => {
        TARGETS[`mc_${f}`] = vars.mcAns[f];
        TARGETS[`mc_${f}_bin`] = (vars.mcAns[f] >>> 0).toString(2).padStart(f === 'op' ? 6 : 5, '0');
      });
      TARGETS['mc_imm'] = vars.mcAns.imm;
      TARGETS['mc_imm_bin'] = (vars.mcAns.imm & 0xFFFF).toString(2).padStart(16, '0');
    }

    vars.revQuestions.forEach(q => { Object.keys(q.ans).forEach(key => { TARGETS[`${q.id}_${key}`] = q.ans[key]; }); });

    const newScores = {};
    Object.keys(TARGETS).forEach(key => {
      const isInst = key.endsWith('_inst');
      newScores[key] = checkValue(answers[key] || '', TARGETS[key], isInst);
    });

    setScores(newScores); 
    setIsSubmitted(true);
    setRevealed({});
  };

  const isDark = theme === 'dark';
  const shouldShowKey = mode === 'practice' || isSubmitted;

  const themeVars = {
    containerBg: isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800',
    cardBg: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300',
    inputBg: isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900',
    answerKeyBg: isDark ? 'bg-emerald-900/20 border-emerald-700/40 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-800',
    stepHeader: isDark ? 'text-emerald-400' : 'text-emerald-700',
    yellowBox: isDark ? 'text-amber-400 bg-amber-900/40 border-transparent' : 'text-amber-700 bg-amber-100 border-amber-300',
    blueBox: isDark ? 'bg-blue-900/20 border-blue-800 text-slate-200' : 'bg-blue-50 border-blue-200 text-slate-800',
    code: isDark ? 'bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded' : 'bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded',
  };

  const getAnswerDisplay = (id) => {
    if (id.startsWith('rev1_') || id.startsWith('rev2_') || id.startsWith('rev3_')) {
      const [qId, key] = id.split('_'); return vars.revQuestions.find(x => x.id === qId).ans[key];
    }
    const TARGETS = {
      'mem_a': vars.memAns.a, 'mem_b': vars.memAns.b, 'mem_c': vars.memAns.c, 'mem_d': vars.memAns.d, 'mem_e': vars.memAns.e, 'mem_f': vars.memAns.f, 'mem_g': vars.memAns.g,
      'arr_s0': vars.arrAns.s0, 'arr_s1': vars.arrAns.s1, 'arr_s4': vars.arrAns.s4,
      'bit_a1': vars.bitAns.a1, 'bit_a2': vars.bitAns.a2, 'bit_a3': vars.bitAns.a3, 'bit_a4': vars.bitAns.a4,
      'seq_s1': vars.seqAns.s1, 'seq_s2': vars.seqAns.s2, 'seq_s3': vars.seqAns.s3,
      'mc_op': vars.mcAns.op, 'mc_rs': vars.mcAns.rs, 'mc_rt': vars.mcAns.rt, 'mc_rd': vars.mcAns.rd, 'mc_shamt': vars.mcAns.shamt, 'mc_funct': vars.mcAns.funct, 'mc_imm': vars.mcAns.imm, 'mc_hex': vars.mcAns.machineCode,
    };
    return TARGETS[id];
  };

  const renderInput = (id, placeholder, width = "w-40 md:w-48") => (
    <div className="flex items-center gap-3 flex-wrap max-w-full">
      <input type="text" value={answers[id] || ''} onChange={(e) => handleChange(id, e.target.value)} placeholder={placeholder} className={`${width} max-w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center ${themeVars.inputBg}`} />
      {isSubmitted && (scores[id] ? <CheckIcon /> : <CrossIcon />)}
      {shouldShowKey && (
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <button onClick={() => toggleReveal(id)} className="p-1.5 flex-shrink-0 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
          {revealed[id] && <div className={`px-2 py-1 rounded-md border font-bold font-mono text-sm whitespace-nowrap overflow-x-auto ${themeVars.yellowBox}`}>{getAnswerDisplay(id)}</div>}
        </div>
      )}
    </div>
  );

  // --- Chapter 4 Datapath Style Machine Code Box ---
  const renderFormatBlock = (prefix, type) => {
    
    const renderFieldCell = (id, label, bits, flexClass, fieldKey) => {
      const prefix = id.split('_')[0];
      const parentKey = prefix === 'mc' ? 'mc_hex' : `${prefix}_inst`;
      const isRev = revealed[parentKey];
      const maxLen = Number(bits);
      const fieldColors = getFieldColors(isDark);
      const binId = `${id}_bin`;

      // Compute the correct binary answer for the binary row (only used for mc_ fields)
      const getBinAnswer = () => {
        const val = getAnswerDisplay(id);
        if (val === undefined || val === null) return '';
        return (Number(val) >>> 0).toString(2).padStart(Number(bits), '0');
      };

      return (
        <div key={id} className={`${flexClass} flex flex-col border-r last:border-0 relative transition-all duration-300 ${isDark ? 'border-slate-600' : 'border-slate-300'} ${isRev ? fieldColors[fieldKey] : themeVars.inputBg}`}>
          {/* Header */}
          <div className={`py-1 text-center text-[10px] md:text-xs font-bold uppercase tracking-wider border-b ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            {label} <span className="opacity-60 font-normal">({bits})</span>
          </div>

          {/* Decimal row */}
          <div className="flex flex-col items-center justify-center p-2 relative h-16">
            <input
              type="text"
              value={answers[id] || ''}
              onChange={(e) => handleChange(id, e.target.value.replace(/[^0-9-]/g, ''))}
              maxLength={maxLen}
              placeholder="Dec"
              className={`w-full h-full text-center bg-transparent focus:outline-none font-mono text-base md:text-lg rounded transition-opacity duration-200 ${isDark ? 'text-white' : 'text-slate-900'} ${isRev ? 'opacity-0 pointer-events-none' : ''}`}
            />
            {isRev && (
              <div className="absolute inset-0 flex items-center justify-center font-bold font-mono text-base md:text-lg pointer-events-none select-none">
                {getAnswerDisplay(id)}
              </div>
            )}
            {isSubmitted && (
              <div className="absolute top-1 right-1 opacity-80 pointer-events-none">
                {scores[id] ? <CheckIcon size={14} /> : <CrossIcon size={14} />}
              </div>
            )}
          </div>

          {/* Binary row — only shown for Part A (mc_ prefix) */}
          {prefix === 'mc' && (
            <>
              <div className={`py-0.5 text-center text-[9px] font-semibold uppercase tracking-wider border-t border-b opacity-60 ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                binary
              </div>
              <div className="flex flex-col items-center justify-center px-1 py-2 relative h-14">
                <input
                  type="text"
                  value={answers[binId] || ''}
                  onChange={(e) => handleChange(binId, e.target.value.replace(/[^01]/g, ''))}
                  maxLength={Number(bits)}
                  placeholder={'0'.repeat(Number(bits))}
                  className={`w-full h-full text-center bg-transparent focus:outline-none font-mono text-[10px] md:text-xs rounded transition-opacity duration-200 tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'} ${isRev ? 'opacity-0 pointer-events-none' : ''}`}
                />
                {isRev && (
                  <div className="absolute inset-0 flex items-center justify-center font-bold font-mono text-[10px] md:text-xs pointer-events-none select-none tracking-widest">
                    {getBinAnswer()}
                  </div>
                )}
                {isSubmitted && (
                  <div className="absolute top-1 right-1 opacity-80 pointer-events-none">
                    {scores[binId] ? <CheckIcon size={14} /> : <CrossIcon size={14} />}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    };

    if (type === 'R') {
      return (
        <div className={`overflow-x-auto w-full my-6 pb-2`}>
          <div className={`flex min-w-[500px] border-2 rounded-xl overflow-hidden shadow-sm ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            {renderFieldCell(`${prefix}_op`, 'op', '6', 'flex-[1.2]', 'op')}
            {renderFieldCell(`${prefix}_rs`, 'rs', '5', 'flex-1', 'rs')}
            {renderFieldCell(`${prefix}_rt`, 'rt', '5', 'flex-1', 'rt')}
            {renderFieldCell(`${prefix}_rd`, 'rd', '5', 'flex-1', 'rd')}
            {renderFieldCell(`${prefix}_shamt`, 'shamt', '5', 'flex-1', 'shamt')}
            {renderFieldCell(`${prefix}_funct`, 'funct', '6', 'flex-[1.2]', 'funct')}
          </div>
        </div>
      );
    } else {
      return (
        <div className={`overflow-x-auto w-full my-6 pb-2`}>
          <div className={`flex min-w-[500px] border-2 rounded-xl overflow-hidden shadow-sm ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            {renderFieldCell(`${prefix}_op`, 'op', '6', 'flex-[1.2]', 'op')}
            {renderFieldCell(`${prefix}_rs`, 'rs', '5', 'flex-1', 'rs')}
            {renderFieldCell(`${prefix}_rt`, 'rt', '5', 'flex-1', 'rt')}
            {renderFieldCell(`${prefix}_imm`, 'immediate', '16', 'flex-[3.2]', 'imm')}
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`h-screen w-full overflow-y-auto flex flex-col items-center p-4 md:p-10 pb-40 transition-colors duration-300 ${themeVars.containerBg}`}>
      {refTableOpen && <RefTableModal onClose={() => setRefTableOpen(false)} isDark={isDark} />}
      <div className="w-full max-w-6xl">
        
        {/* Header & Main Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold">Chapter 2: MIPS Instructions</h1>
          
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button onClick={handleRandomize} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors">
              <DiceIcon /> Randomize 
            </button>
            <button onClick={() => setRefTableOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-slate-600 hover:bg-slate-500 text-white shadow-md transition-colors">
              <BookIcon /> Reference
            </button>
            <div className={`flex p-1 rounded-lg shadow-sm ${isDark ? 'bg-slate-800' : 'bg-slate-200/80 border border-slate-300'}`}>
              <button 
                onClick={() => { setMode('practice'); setRevealed({}); }} 
                className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'practice' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                Practice
              </button>
              <button 
                onClick={() => { setMode('test'); setRevealed({}); setIsSubmitted(false); }} 
                className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'test' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                Test
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Reduced to 3 */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-500/30 pb-2">
          {[
            { id: 'memory', label: '1. Memory & Arrays' },
            { id: 'bitwise', label: '2. Logic & Sequences' },
            { id: 'machinecode', label: '3. Machine Code' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSubmitted(false); setRevealed({}); }}
              className={`px-4 md:px-6 py-3 rounded-t-lg font-bold transition-colors text-sm md:text-base ${activeTab === tab.id ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== TAB 1: MEMORY & ARRAYS ==================== */}
        {activeTab === 'memory' && (
          <div className="space-y-8">
            <div className={`p-6 md:p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part A: Address Mapping</h2>
              <p>Given the following <strong>Big-Endian</strong> memory map. Assume <code className={themeVars.code}>$t0</code> stores <strong>8</strong>, and <code className={themeVars.code}>$s0</code> stores <strong>0xCAFEFACE</strong>.</p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 my-6 font-mono text-center">
                {Object.keys(vars.memoryMap).map((addr) => (
                  <div key={addr} className={`p-2 rounded border ${themeVars.blueBox}`}>
                    <div className="text-xs opacity-70 mb-1">Addr {addr}</div>
                    <div className="font-bold">{toHex(vars.memoryMap[addr], 2)}</div>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-lg">
                <div className="space-y-6">
                  {['a', 'b', 'c', 'd'].map(id => (
                    <div key={id}>
                      <p className="font-mono mb-2">{id}) {
                        id === 'a' ? 'lw $t1, 0($t0)' : 
                        id === 'b' ? 'lw $t2, 4($t0)' : 
                        id === 'c' ? 'lh $t6, 4($t0)' : 
                        'lb $t5, 3($t0)'
                      }</p>
                      {renderInput(`mem_${id}`, '0x...')}
                      {revealed[`mem_${id}`] && (
                        <div className={`mt-4 p-4 md:p-5 rounded-xl border text-sm md:text-base overflow-x-auto ${themeVars.answerKeyBg}`}>
                          <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                          <p>{vars.memExpl[id]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {['e', 'f', 'g'].map(id => (
                    <div key={id}>
                      <p className="font-mono mb-2">{id}) {
                        id === 'e' ? 'sw $s0, 0($t0)' : 
                        id === 'f' ? 'sb $s0, 4($t0)' : 
                        'lh $s0, 7($t0)'
                      }</p>
                      {renderInput(`mem_${id}`, id === 'g' ? 'e.g. Error' : '0x..')}
                      {revealed[`mem_${id}`] && (
                        <div className={`mt-4 p-4 md:p-5 rounded-xl border text-sm md:text-base overflow-x-auto ${themeVars.answerKeyBg}`}>
                          <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                          <p>{vars.memExpl[id]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-6 md:p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part B: Array Manipulation</h2>
              <p className="mb-4">Assume an array <strong>[{vars.arrVars.v1}, {vars.arrVars.v2}, {vars.arrVars.v3}]</strong> with base address in <code className={themeVars.code}>$t0</code>. Final decimal values?</p>
              <div className={`p-4 rounded-lg font-mono mb-6 overflow-x-auto ${themeVars.blueBox} inline-block`}>
                <div className="whitespace-pre">
                  lh $s0, 2($t0)<br/>lh $s1, 6($t0)<br/>add $s3, $s1, $s0<br/>sb $s3, 8($t0)<br/>lh $s4, 10($t0)
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-lg">
                {['s0', 's1', 's4'].map(reg => (
                  <div key={reg}>
                    <p className="font-semibold mb-2">${reg} Value:</p>
                    {renderInput(`arr_${reg}`, 'e.g. 1024', 'w-full md:w-40')}
                    {revealed[`arr_${reg}`] && (
                      <div className={`mt-4 p-4 md:p-5 rounded-xl border text-sm md:text-base overflow-x-auto ${themeVars.answerKeyBg}`}>
                        <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                        <p>{vars.arrExpl[reg]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: BITWISE LOGIC ==================== */}
        {activeTab === 'bitwise' && (
          <div className="space-y-8">
            <div className={`p-6 md:p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part A: Core Logical Operations</h2>
              
              {/* Question text wrapping normally */}
              <p className="mb-6">Assume <code className={themeVars.code}>$s0 = {toHex(vars.bitVars.v0, 8)}</code> and <code className={themeVars.code}>$s1 = {toHex(vars.bitVars.v1, 8)}</code>. What is the value of <code className={themeVars.code}>$s2</code> (in hex)?</p>
              
              <div className="grid md:grid-cols-2 gap-8 text-lg">
                {[
                  { id: 'a1', code: `1. sll $s2, $s0, ${vars.bitVars.shamt}` },
                  { id: 'a2', code: `2. and $s2, $s0, $s1` },
                  { id: 'a3', code: `3. or $s2, $s0, $s1` },
                  { id: 'a4', code: `4. andi $s2, $s0, ${vars.bitVars.imm}` }
                ].map(({ id, code }) => (
                  <div key={id} className="min-w-0">
                    <p className="font-mono mb-2 break-all">{code}</p>
                    {renderInput(`bit_${id}`, '0x...')}
                    {revealed[`bit_${id}`] && (
                      <div className={`mt-4 p-4 md:p-5 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>
                        <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                        {/* Step by step blocks have horizontal scroll so formulas/code don't break UI */}
                        <pre className="font-mono text-xs md:text-sm leading-relaxed overflow-x-auto pb-2">{vars.bitExpl[id]}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 md:p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part B: Instruction Sequences</h2>
              
              {/* Question text wrapping normally */}
              <p className="mb-6">Find the final value of <code className={themeVars.code}>$t2</code> if <code className={themeVars.code}>$t0 = {toHex(vars.seqVars.v0, 8)}</code> and <code className={themeVars.code}>$t1 = {toHex(vars.seqVars.v1, 8)}</code>.</p>

              <div className="grid md:grid-cols-3 gap-6 text-lg">
                {[
                  { id: 's1', title: 'Sequence 1', inst: `sll $t2, $t0, ${vars.seqVars.sh1}\nor $t2, $t2, $t1` },
                  { id: 's2', title: 'Sequence 2', inst: `sll $t2, $t0, ${vars.seqVars.sh1}\nandi $t2, $t2, -2` },
                  { id: 's3', title: 'Sequence 3', inst: `srl $t2, $t0, ${vars.seqVars.sh3}\nandi $t2, $t2, 0xFFEF` }
                ].map(({ id, title, inst }) => (
                  <div key={id} className="flex flex-col min-w-0">
                    <div className={`p-4 md:p-5 border rounded-xl flex-grow ${themeVars.blueBox}`}>
                      <h3 className="font-bold border-b border-current pb-2 mb-4 opacity-80">{title}</h3>
                      <div className="font-mono mb-6 whitespace-pre-line text-sm md:text-base">{inst}</div>
                      {renderInput(`seq_${id}`, '0x...', 'w-full')}
                    </div>
                    {revealed[`seq_${id}`] && (
                      <div className={`mt-4 p-4 md:p-5 rounded-xl border shadow-sm overflow-x-auto ${themeVars.answerKeyBg}`}>
                        <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                        {/* Step by step blocks have horizontal scroll so formulas/code don't break UI */}
                        <pre className="font-mono text-xs md:text-sm leading-relaxed overflow-x-auto pb-2">{vars.seqExpl[id]}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: MACHINE CODE (DATAPATH UI) ==================== */}
        {activeTab === 'machinecode' && (
          <div className="space-y-8">
            <div className={`p-6 md:p-10 rounded-2xl border shadow-lg overflow-x-auto ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part A: Assembly to Machine Code</h2>
              <p className="mb-4">Translate the following instruction into a 32-bit Machine Code string using the breakdown below.</p>
              
              <div className={`inline-block px-4 md:px-6 py-4 rounded-lg font-mono text-lg md:text-2xl font-bold tracking-wider mb-2 ${themeVars.blueBox}`}>
                <ColoredInstruction q={vars.mcAns} revealedObj={revealed} prefix="mc" parentRevealKey="mc_hex" isDark={isDark} />
              </div>

              {renderFormatBlock('mc', vars.mcAns.type)}
              
              <div className="pt-2 flex flex-col md:flex-row items-start md:items-center gap-4">
                <p className="font-semibold whitespace-nowrap">Final 32-bit Hex:</p>
                {renderInput('mc_hex', '0x...', 'w-full md:w-48')}
              </div>
            </div>

            <div className={`p-6 md:p-10 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-6 text-blue-500">Part B: Decode Instruction Format</h2>
              <p className="mb-8">Identify the format, populate the datapath fields, and write the final assembly instruction.</p>
              
              <div className="space-y-12">
                {vars.revQuestions.map((q, idx) => (
                  <div key={q.id} className="relative">
                    <div className={`absolute -left-4 -top-4 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-md border-4 z-10 ${isDark ? 'border-slate-800' : 'border-white'}`}>
                      {idx + 1}
                    </div>
                    
                    <div className={`pt-10 pb-8 px-4 md:px-8 border rounded-xl shadow-inner ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      
                      <div className={`inline-block px-4 md:px-6 py-4 rounded-lg font-mono text-lg md:text-2xl font-bold tracking-wider mb-4 ${themeVars.blueBox} shadow-sm border-l-4 border-blue-500`}>
                        <div className="text-center mb-2">{q.hex}</div>
                        <div className="text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.15em] whitespace-nowrap overflow-x-auto">
                          <ColoredBinary q={q} revealedObj={revealed} prefix={q.id} parentRevealKey={`${q.id}_inst`} isDark={isDark} />
                        </div>
                      </div>
                      
                      <p className="text-sm italic opacity-80 mb-2 flex items-center gap-2">
                         <span className="text-amber-500">💡</span> {q.hint}
                      </p>

                      {renderFormatBlock(q.id, q.type)}
                        
                      <div className="pt-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                        <p className="font-semibold whitespace-nowrap">Final Assembly:</p>
                        {renderInput(`${q.id}_inst`, 'e.g. add $t0, $s1, $s2', 'w-full md:w-64')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Submit Button */}
        <div className="mt-10 mb-20 pt-8 border-t border-slate-500/30 flex justify-center">
          <button onClick={verifyAnswers} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-xl transition-colors w-full sm:w-auto shadow-md transform hover:scale-105">
            Verify Answers
          </button>
        </div>

      </div>
    </div>
  );
};

