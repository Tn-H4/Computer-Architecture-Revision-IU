import React, { useState } from 'react';
import { useDiagramStore } from '../../../store/diagramStore';

import { generateVariables } from '../../../utils/chapter1Engine.js';
import { KeyIcon, CheckIcon, CrossIcon, DiceIcon } from '../../shared/WorksheetIcons';
import MathFraction from '../../shared/MathFraction';
import { getWorksheetTheme } from '../../shared/worksheetTheme';
import { checkAnswer } from '../../../utils/worksheetHelpers.js';

// --- MAIN COMPONENT ---

export default function Chapter1() {
  const { theme } = useDiagramStore();
  
  const [mode, setMode] = useState('practice');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vars, setVars] = useState(generateVariables());
  
  const [answers, setAnswers] = useState({ 
    q1a: '', q1b: '', q1c: '',
    q2a: '', q2b: '', q2c: '',
    q3a: '', q3b: '', q3c: ''
  });
  
  const [scores, setScores] = useState({ 
    q1a: null, q1b: null, q1c: null,
    q2a: null, q2b: null, q2c: null,
    q3a: null, q3b: null, q3c: null 
  });
  
  const [revealed, setRevealed] = useState({ 
    q1a: false, q1b: false, q1c: false,
    q2a: false, q2b: false, q2c: false,
    q3a: false, q3b: false, q3c: false
  });

  const TARGET_ANSWERS = {
    q1a: { value: vars.q1.ansA, type: 'number', tolerance: 0.05 },
    q1b: { value: vars.q1.ansB, type: 'number', tolerance: 0.05 },
    q1c: { value: vars.q1.ansC, type: 'number', tolerance: 0.05 },
    q2a: { value: vars.q2.ansA, type: 'number', tolerance: 0.05 },
    q2b: { value: vars.q2.ansB, type: 'number', tolerance: 0.05 },
    q2c: { value: vars.q2.ansC, type: 'number', tolerance: 0.05 },
    q3a: { value: vars.q3.ansA, type: typeof vars.q3.ansA === 'string' ? 'string' : 'number', tolerance: 0.05 },
    q3b: { value: vars.q3.ansB, type: typeof vars.q3.ansB === 'string' ? 'string' : 'number', tolerance: 0.05 },
    q3c: { value: vars.q3.ansC, type: 'number', tolerance: 0.05 }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsSubmitted(false);
    setRevealed({ 
      q1a: false, q1b: false, q1c: false, 
      q2a: false, q2b: false, q2c: false,
      q3a: false, q3b: false, q3c: false 
    });
  };

  const handleRandomize = () => {
    setVars(generateVariables());
    setAnswers({ q1a: '', q1b: '', q1c: '', q2a: '', q2b: '', q2c: '', q3a: '', q3b: '', q3c: '' });
    setScores({ q1a: null, q1b: null, q1c: null, q2a: null, q2b: null, q2c: null, q3a: null, q3b: null, q3c: null });
    setIsSubmitted(false);
    setRevealed({ q1a: false, q1b: false, q1c: false, q2a: false, q2b: false, q2c: false, q3a: false, q3b: false, q3c: false });
  };

  const handleInputChange = (e, field) => {
    setAnswers({ ...answers, [field]: e.target.value });
    setIsSubmitted(false); 
  };

  const toggleReveal = (field) => {
    setRevealed({ ...revealed, [field]: !revealed[field] });
  };

  const verifyAnswers = () => {
    const checkAnswer = (input, target) => {
      if (target.type === 'string') {
        return input.trim().toLowerCase() === target.value.toString().toLowerCase();
      }
      const num = parseFloat(input);
      if (isNaN(num)) return false;
      return Math.abs(num - target.value) <= target.tolerance;
    };

    setScores({
      q1a: checkAnswer(answers.q1a, TARGET_ANSWERS.q1a),
      q1b: checkAnswer(answers.q1b, TARGET_ANSWERS.q1b),
      q1c: checkAnswer(answers.q1c, TARGET_ANSWERS.q1c),
      q2a: checkAnswer(answers.q2a, TARGET_ANSWERS.q2a),
      q2b: checkAnswer(answers.q2b, TARGET_ANSWERS.q2b),
      q2c: checkAnswer(answers.q2c, TARGET_ANSWERS.q2c),
      q3a: checkAnswer(answers.q3a, TARGET_ANSWERS.q3a),
      q3b: checkAnswer(answers.q3b, TARGET_ANSWERS.q3b),
      q3c: checkAnswer(answers.q3c, TARGET_ANSWERS.q3c),
    });
    setIsSubmitted(true);
  };

  const isDark = theme === 'dark';
  const shouldShowKey = mode === 'practice' || isSubmitted;

  const themeVars = {
    containerBg: isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800',
    cardBg: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300',
    inputBg: isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900',
    answerKeyBg: isDark ? 'bg-emerald-900/20 border-emerald-700/40 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-800',
    title: isDark ? 'text-blue-400' : 'text-blue-600',
    stepHeader: isDark ? 'text-emerald-400' : 'text-emerald-700',
    yellowBox: isDark ? 'text-amber-400 bg-amber-900/40 border-transparent' : 'text-amber-700 bg-amber-100 border-amber-300',
    blueBox: isDark ? 'bg-blue-900/20 border-blue-800 text-slate-200' : 'bg-blue-50 border-blue-200 text-slate-800',
    blueBoxText: isDark ? 'text-blue-300' : 'text-blue-800',
    greenBox: isDark ? 'bg-emerald-900/20 border-emerald-800 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-800',
    greenBoxText: isDark ? 'text-emerald-400' : 'text-emerald-800',
    code: isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-800',
    redText: isDark ? 'text-red-400' : 'text-red-600'
  };

  return (
    <div className={`h-screen w-full overflow-y-auto flex flex-col items-center p-6 md:p-10 pb-40 md:pb-40 transition-colors duration-300 ${themeVars.containerBg}`}>
      
      <div className="w-full max-w-6xl">
        
        {/* Header & Mode Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold">Chapter 1: CPU Performance</h1>
          <div className="flex gap-4 items-center">
            
            <button 
              onClick={handleRandomize}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
            >
              <DiceIcon /> Randomize Numbers
            </button>

            <div className={`flex p-1 rounded-lg shadow-sm ${isDark ? 'bg-slate-800' : 'bg-slate-200/80 border border-slate-300'}`}>
              <button 
                onClick={() => handleModeChange('practice')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'practice' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Practice Mode
              </button>
              <button 
                onClick={() => handleModeChange('test')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'test' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Test Mode
              </button>
            </div>
          </div>
        </div>

        {/* ==================== QUESTION 1 ==================== */}
        <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-8 ${themeVars.cardBg}`}>
          <div className="mb-8 space-y-3 text-lg">
            <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 1</h2>
            <p>A program is executed on a <strong>{vars.q1.clock} GHz CPU</strong>. The program consists of <strong>{vars.q1.ic} instructions</strong> in which:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>{vars.q1.pLS}% load/store instructions, CPI = {vars.q1.cpiLS.toFixed(1)}</li>
              <li>{vars.q1.pJump}% jump instructions, CPI = {vars.q1.cpiJump.toFixed(1)}</li>
              <li>{vars.q1.pBranch}% branch instructions, CPI = {vars.q1.cpiBranch.toFixed(1)}</li>
              <li>The rest ({vars.q1.pArith}%) are arithmetic instructions, CPI = {vars.q1.cpiArith.toFixed(1)}</li>
            </ul>
          </div>

          <div className="space-y-10 text-lg">
            
            {/* Q1 Part A */}
            <div>
              <p className="font-semibold mb-4">a) What is execution time (CPU time) of the program? (in microseconds &mu;s)</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q1a} onChange={(e) => handleInputChange(e, 'q1a')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                <span className="font-medium">&mu;s</span>
                
                {isSubmitted && scores.q1a && <CheckIcon />}
                {isSubmitted && !scores.q1a && <CrossIcon />}
                
                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q1a')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q1a && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q1a.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q1a Step-by-Step Dropdown */}
              {revealed.q1a && (
                <div className={`mt-4 p-4 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>                  <p>Total Cycles = ({(vars.q1.ic * vars.q1.pLS / 100).toFixed(0)} × {vars.q1.cpiLS}) + ({(vars.q1.ic * vars.q1.pJump / 100).toFixed(0)} × {vars.q1.cpiJump}) + ({(vars.q1.ic * vars.q1.pBranch / 100).toFixed(0)} × {vars.q1.cpiBranch}) + ({(vars.q1.ic * vars.q1.pArith / 100).toFixed(0)} × {vars.q1.cpiArith}) = <strong>{vars.q1.q1Cycles.toFixed(0)} cycles</strong></p>
                  <p className="mt-3 flex items-center flex-wrap">
                    <span>CPU Time =</span> 
                    <MathFraction num="Total Cycles" den="Clock Rate" isDark={isDark} /> 
                    <span>=</span>
                    <MathFraction num={vars.q1.q1Cycles.toFixed(0)} den={<span>{vars.q1.clock} × 10<sup>9</sup></span>} isDark={isDark} />
                    <span>= {vars.q1.ansA.toFixed(4)} × 10<sup>-6</sup> s = <strong>{vars.q1.ansA.toFixed(4)} &mu;s</strong></span>
                  </p>
                </div>
              )}
            </div>

            {/* Q1 Part B */}
            <div>
              <p className="font-semibold mb-4">b) What is the weighted average CPI of the program?</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q1b} onChange={(e) => handleInputChange(e, 'q1b')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q1b && <CheckIcon />}
                {isSubmitted && !scores.q1b && <CrossIcon />}

                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q1b')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q1b && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q1b.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q1b Step-by-Step Dropdown */}
              {revealed.q1b && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p className="flex items-center flex-wrap">
                    <span>CPI<sub>avg</sub> =</span> 
                    <MathFraction num="Total Cycles" den="IC" isDark={isDark} />
                    <span>=</span>
                    <MathFraction num={vars.q1.q1Cycles.toFixed(0)} den={vars.q1.ic} isDark={isDark} />
                    <span>= <strong>{vars.q1.ansB.toFixed(4)}</strong></span>
                  </p>
                </div>
              )}
            </div>

            {/* Q1 Part C */}
            <div>
              <p className="font-semibold mb-4">c) If load/store instructions are improved so that their execution time is reduced by a factor of {vars.q1.improveFactor}, what is the speed-up of the system?</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q1c} onChange={(e) => handleInputChange(e, 'q1c')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q1c && <CheckIcon />}
                {isSubmitted && !scores.q1c && <CrossIcon />}

                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q1c')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q1c && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q1c.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q1c Step-by-Step Dropdown */}
              {revealed.q1c && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p className="flex items-center flex-wrap">
                    <span>CPI<sub>LS_new</sub> =</span> 
                    <MathFraction num={vars.q1.cpiLS.toFixed(2)} den={vars.q1.improveFactor} isDark={isDark} />
                    <span>= {vars.q1.newCPILS.toFixed(4)}</span>
                  </p>
                  <p className="mt-3">New Total Cycles = ({(vars.q1.ic * vars.q1.pLS / 100).toFixed(0)} × {vars.q1.newCPILS.toFixed(4)}) + {(vars.q1.ic * vars.q1.pJump / 100).toFixed(0)} + {(vars.q1.ic * vars.q1.pBranch / 100).toFixed(0)} + {(vars.q1.ic * vars.q1.pArith / 100).toFixed(0)} = <strong>{vars.q1.newQ1Cycles.toFixed(2)} cycles</strong></p>
                  <p className="mt-3 flex items-center flex-wrap">
                    <span>New CPU Time =</span> 
                    <MathFraction num={vars.q1.newQ1Cycles.toFixed(2)} den={<span>{vars.q1.clock} × 10<sup>9</sup></span>} isDark={isDark} />
                    <span>= {(vars.q1.newQ1Cycles / (vars.q1.clock * 1000)).toFixed(4)} &mu;s</span>
                  </p>
                  <p className={`mt-3 flex items-center font-semibold flex-wrap ${themeVars.stepHeader}`}>
                    <span>Speed-up =</span> 
                    <MathFraction num="Original Cycles" den="New Cycles" isDark={isDark} />
                    <span>=</span>
                    <MathFraction num={vars.q1.q1Cycles.toFixed(0)} den={vars.q1.newQ1Cycles.toFixed(2)} isDark={isDark} />
                    <span>&asymp; <strong>{vars.q1.ansC.toFixed(4)}</strong></span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* ==================== QUESTION 2 ==================== */}
        <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-8 ${themeVars.cardBg}`}>
          <div className="mb-8 space-y-3 text-lg">
            <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 2</h2>
            <p>Suppose we have the following measurements for a processor:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Frequency of FP (Floating Point) instructions = {vars.q2.pFP}%</li>
              <li>Average CPI of FP operations = {vars.q2.cpiFP.toFixed(2)}</li>
              <li>Average CPI of other instructions = {vars.q2.cpiOther.toFixed(2)}</li>
              <li>Frequency of FPSQR = {vars.q2.pFPSQR}%</li>
              <li>CPI of FPSQR = {vars.q2.cpiFPSQR}</li>
            </ul>
            
            <div className={`mt-4 p-5 rounded-xl border ${themeVars.blueBox}`}>
              <strong className={themeVars.blueBoxText}>Design Alternatives to Compare:</strong><br/>
              <span className="inline-block mt-2"><strong>Alt 1:</strong> Decrease the CPI of FPSQR to {vars.q2.alt1FPSQR_CPI}.</span><br/>
              <span className="inline-block mt-1"><strong>Alt 2:</strong> Decrease the average CPI of all FP operations to {vars.q2.alt2FP_CPI.toFixed(2)}.</span>
            </div>
          </div>

          <div className="space-y-10 text-lg">
            
            {/* Q2 Part A */}
            <div>
              <p className="font-semibold mb-4">a) What is the original Base CPI of the system before improvements?</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q2a} onChange={(e) => handleInputChange(e, 'q2a')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q2a && <CheckIcon />}
                {isSubmitted && !scores.q2a && <CrossIcon />}
                
                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q2a')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q2a && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q2a.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q2a Step-by-Step Dropdown */}
              {revealed.q2a && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Frequency of "Other" = 100% - {vars.q2.pFP}% = {vars.q2.pOther}%</p>
                  <p className="mt-2">CPI<sub>base</sub> = (Freq<sub>FP</sub> × CPI<sub>FP</sub>) + (Freq<sub>other</sub> × CPI<sub>other</sub>)</p>
                  <p className="mt-2">CPI<sub>base</sub> = ({(vars.q2.pFP/100).toFixed(2)} × {vars.q2.cpiFP.toFixed(2)}) + ({(vars.q2.pOther/100).toFixed(2)} × {vars.q2.cpiOther.toFixed(2)}) = {((vars.q2.pFP/100)*vars.q2.cpiFP).toFixed(4)} + {((vars.q2.pOther/100)*vars.q2.cpiOther).toFixed(4)} = <strong>{vars.q2.ansA.toFixed(4)}</strong></p>
                </div>
              )}
            </div>

            {/* Q2 Part B */}
            <div>
              <p className="font-semibold mb-4">b) What is the resulting Speed-up if we implement Alternative 1?</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q2b} onChange={(e) => handleInputChange(e, 'q2b')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q2b && <CheckIcon />}
                {isSubmitted && !scores.q2b && <CrossIcon />}

                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q2b')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q2b && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q2b.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q2b Step-by-Step Dropdown */}
              {revealed.q2b && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p className="text-sm italic mb-3 opacity-80">
                    *Formula: CPI<sub>new</sub> = CPI<sub>base</sub> - Freq<sub>impacted</sub> × (CPI<sub>old</sub> - CPI<sub>new</sub>)
                  </p>
                  <p>CPI<sub>alt1</sub> = {vars.q2.ansA.toFixed(4)} - [ {(vars.q2.pFPSQR/100).toFixed(2)} × ({vars.q2.cpiFPSQR} - {vars.q2.alt1FPSQR_CPI}) ]</p>
                  <p className="mt-1">CPI<sub>alt1</sub> = {vars.q2.ansA.toFixed(4)} - {((vars.q2.pFPSQR/100) * (vars.q2.cpiFPSQR - vars.q2.alt1FPSQR_CPI)).toFixed(4)} = <strong>{vars.q2.alt1CPI.toFixed(4)}</strong></p>
                  
                  <p className="mt-4 flex items-center font-semibold flex-wrap">
                    <span>Speed-up<sub>1</sub> =</span> 
                    <MathFraction num={<span>CPI<sub>base</sub></span>} den={<span>CPI<sub>alt1</sub></span>} isDark={isDark} />
                    <span>=</span>
                    <MathFraction num={vars.q2.ansA.toFixed(4)} den={vars.q2.alt1CPI.toFixed(4)} isDark={isDark} />
                    <span>&asymp; <strong>{vars.q2.ansB.toFixed(4)}</strong></span>
                  </p>
                </div>
              )}
            </div>

            {/* Q2 Part C */}
            <div>
              <p className="font-semibold mb-4">c) What is the resulting Speed-up if we implement Alternative 2?</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q2c} onChange={(e) => handleInputChange(e, 'q2c')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q2c && <CheckIcon />}
                {isSubmitted && !scores.q2c && <CrossIcon />}

                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q2c')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q2c && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q2c.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q2c Step-by-Step Dropdown */}
              {revealed.q2c && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>CPI<sub>alt2</sub> = {vars.q2.ansA.toFixed(4)} - [ {(vars.q2.pFP/100).toFixed(2)} × ({vars.q2.cpiFP.toFixed(2)} - {vars.q2.alt2FP_CPI.toFixed(2)}) ]</p>
                  <p className="mt-1">CPI<sub>alt2</sub> = {vars.q2.ansA.toFixed(4)} - {((vars.q2.pFP/100)*(vars.q2.cpiFP - vars.q2.alt2FP_CPI)).toFixed(4)} = <strong>{vars.q2.alt2CPI.toFixed(4)}</strong></p>
                  
                  <p className={`mt-4 flex items-center font-semibold flex-wrap ${themeVars.stepHeader}`}>
                    <span>Speed-up<sub>2</sub> =</span> 
                    <MathFraction num={<span>CPI<sub>base</sub></span>} den={<span>CPI<sub>alt2</sub></span>} isDark={isDark} />
                    <span>=</span>
                    <MathFraction num={vars.q2.ansA.toFixed(4)} den={vars.q2.alt2CPI.toFixed(4)} isDark={isDark} />
                    <span>&asymp; <strong>{vars.q2.ansC.toFixed(4)}</strong></span>
                  </p>
                  <div className={`mt-5 p-4 rounded-lg border ${themeVars.greenBox}`}>
                    <strong className={themeVars.greenBoxText}>Conclusion:</strong> Alternative {vars.q2.alt1Better ? '1' : '2'} yields a higher speed-up ({Math.max(vars.q2.ansB, vars.q2.ansC).toFixed(3)} vs {Math.min(vars.q2.ansB, vars.q2.ansC).toFixed(3)}) and is the better design choice for this configuration.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== QUESTION 3 ==================== */}
        <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-10 ${themeVars.cardBg}`}>
          <div className="mb-8 space-y-3 text-lg">
            <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 3</h2>
            <p>Assume a program requires the execution of the following instructions:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>{vars.q3.fp} × 10<sup>6</sup> FP instructions (CPI = 1)</li>
              <li>{vars.q3.int} × 10<sup>6</sup> INT instructions (CPI = 1)</li>
              <li>{vars.q3.ls} × 10<sup>6</sup> L/S instructions (CPI = {vars.q3.cpiLS})</li>
              <li>{vars.q3.br} × 10<sup>6</sup> Branch instructions (CPI = 2)</li>
            </ul>
          </div>

          <div className="space-y-10 text-lg">
            
            {/* Q3 Part A */}
            <div>
              <p className="font-semibold mb-4">a) By how much must we improve the CPI of FP instructions if we want the program to run {vars.q3.speedupTarget} times faster? (Type <code className={`text-sm font-mono px-2 py-1 rounded ${themeVars.code}`}>Impossible</code> if it cannot be achieved)</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q3a} onChange={(e) => handleInputChange(e, 'q3a')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q3a && <CheckIcon />}
                {isSubmitted && !scores.q3a && <CrossIcon />}
                
                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q3a')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q3a && <span className={`px-3 py-1 rounded-md border font-bold capitalize ${themeVars.yellowBox}`}>
                      {typeof TARGET_ANSWERS.q3a.value === 'number' ? TARGET_ANSWERS.q3a.value.toFixed(4) : TARGET_ANSWERS.q3a.value}
                    </span>}
                  </div>
                )}
              </div>

              {/* Q3a Step-by-Step Dropdown */}
              {revealed.q3a && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p><strong>Step 1: Find total base cycles.</strong></p>
                  <p>Base Cycles = ({vars.q3.fp} × 1) + ({vars.q3.int} × 1) + ({vars.q3.ls} × {vars.q3.cpiLS}) + ({vars.q3.br} × 2) = {vars.q3.fp} + {vars.q3.int} + {vars.q3.ls * vars.q3.cpiLS} + {vars.q3.br * 2} = <strong>{vars.q3.baseCycles} × 10<sup>6</sup> cycles</strong></p>
                  
                  <p className="mt-4"><strong>Step 2: Find target cycles for a {vars.q3.speedupTarget}x speed-up.</strong></p>
                  <p>Target Cycles = {vars.q3.baseCycles} / {vars.q3.speedupTarget} = <strong>{vars.q3.targetCycles.toFixed(2)} × 10<sup>6</sup> cycles</strong></p>

                  <p className="mt-4"><strong>Step 3: Can we achieve this by only modifying FP?</strong></p>
                  <p>Cycles taken by Non-FP instructions = {vars.q3.int} + {vars.q3.ls * vars.q3.cpiLS} + {vars.q3.br * 2} = <strong>{vars.q3.nonFPCycles} × 10<sup>6</sup> cycles</strong>.</p>
                  
                  {vars.q3.ansA === "impossible" ? (
                     <p className={`mt-2 font-semibold ${themeVars.redText}`}>
                        Conclusion: Because the Non-FP cycles ({vars.q3.nonFPCycles}M) alone are already larger than our target total cycles ({vars.q3.targetCycles.toFixed(2)}M), it is Impossible to achieve a {vars.q3.speedupTarget}x speedup just by improving FP. (Amdahl's Law limit)
                     </p>
                  ) : (
                     <p className={`mt-2 font-semibold ${themeVars.greenBoxText}`}>
                        Conclusion: We need to reduce the FP cycles. Target FP CPI = ({vars.q3.targetCycles.toFixed(2)} - {vars.q3.nonFPCycles}) / {vars.q3.fp} = {vars.q3.ansA.toFixed(4)}
                     </p>
                  )}
                </div>
              )}
            </div>

            {/* Q3 Part B */}
            <div>
              <p className="font-semibold mb-4">b) What is the new required CPI for L/S instructions if we want the program to run {vars.q3.speedupTarget} times faster?</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q3b} onChange={(e) => handleInputChange(e, 'q3b')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q3b && <CheckIcon />}
                {isSubmitted && !scores.q3b && <CrossIcon />}

                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q3b')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q3b && <span className={`px-3 py-1 rounded-md border font-bold capitalize ${themeVars.yellowBox}`}>
                      {typeof TARGET_ANSWERS.q3b.value === 'number' ? TARGET_ANSWERS.q3b.value.toFixed(4) : TARGET_ANSWERS.q3b.value}
                    </span>}
                  </div>
                )}
              </div>

              {/* Q3b Step-by-Step Dropdown */}
              {revealed.q3b && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Target Cycles = <strong>{vars.q3.targetCycles.toFixed(2)} × 10<sup>6</sup></strong> <em>(from part A)</em></p>
                  <p className="mt-2">Cycles for Non-L/S instructions (FP, INT, Branch) = {vars.q3.fp} + {vars.q3.int} + {vars.q3.br * 2} = <strong>{vars.q3.nonLSCycles} × 10<sup>6</sup> cycles</strong></p>
                  
                  {vars.q3.ansB === "impossible" ? (
                    <p className={`mt-2 font-semibold ${themeVars.redText}`}>
                        Conclusion: Because the Non-L/S cycles ({vars.q3.nonLSCycles}M) are already larger than the target cycles ({vars.q3.targetCycles.toFixed(2)}M), it is Impossible.
                    </p>
                  ) : (
                    <>
                      <p className="mt-4">Target Cycles specifically for L/S = {vars.q3.targetCycles.toFixed(2)} - {vars.q3.nonLSCycles} = <strong>{(vars.q3.targetCycles - vars.q3.nonLSCycles).toFixed(2)} × 10<sup>6</sup> cycles</strong></p>
                      <p className={`mt-4 flex items-center font-semibold flex-wrap ${themeVars.stepHeader}`}>
                        <span>New CPI<sub>L/S</sub> =</span> 
                        <MathFraction num="Target L/S Cycles" den="L/S Instruction Count" isDark={isDark} />
                        <span>=</span>
                        <MathFraction num={(vars.q3.targetCycles - vars.q3.nonLSCycles).toFixed(2)} den={vars.q3.ls} isDark={isDark} />
                        <span>= <strong>{vars.q3.ansB.toFixed(4)}</strong></span>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Q3 Part C */}
            <div>
              <p className="font-semibold mb-4">c) By how much is the execution time of the program improved if the CPI of INT and FP instructions is reduced by {vars.q3.reduce1}% and the CPI of L/S and Branch is reduced by {vars.q3.reduce2}%? (What is the Speed-up?)</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input type="text" value={answers.q3c} onChange={(e) => handleInputChange(e, 'q3c')} 
                  className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                
                {isSubmitted && scores.q3c && <CheckIcon />}
                {isSubmitted && !scores.q3c && <CrossIcon />}

                {shouldShowKey && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => toggleReveal('q3c')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                    {revealed.q3c && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q3c.value.toFixed(4)}</span>}
                  </div>
                )}
              </div>

              {/* Q3c Step-by-Step Dropdown */}
              {revealed.q3c && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p><strong>Step 1: Calculate New CPIs</strong></p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>New CPI<sub>FP</sub> = 1 × (1 - 0.{vars.q3.reduce1}) = <strong>{vars.q3.newCpiFP.toFixed(2)}</strong></li>
                    <li>New CPI<sub>INT</sub> = 1 × (1 - 0.{vars.q3.reduce1}) = <strong>{vars.q3.newCpiINT.toFixed(2)}</strong></li>
                    <li>New CPI<sub>L/S</sub> = {vars.q3.cpiLS} × (1 - 0.{vars.q3.reduce2}) = <strong>{vars.q3.newCpiLS.toFixed(2)}</strong></li>
                    <li>New CPI<sub>Branch</sub> = 2 × (1 - 0.{vars.q3.reduce2}) = <strong>{vars.q3.newCpiBR.toFixed(2)}</strong></li>
                  </ul>

                  <p><strong>Step 2: Calculate New Total Cycles</strong></p>
                  <p>New Cycles = ({vars.q3.fp} × {vars.q3.newCpiFP.toFixed(2)}) + ({vars.q3.int} × {vars.q3.newCpiINT.toFixed(2)}) + ({vars.q3.ls} × {vars.q3.newCpiLS.toFixed(2)}) + ({vars.q3.br} × {vars.q3.newCpiBR.toFixed(2)})</p>
                  <p>New Cycles = {(vars.q3.fp * vars.q3.newCpiFP).toFixed(2)} + {(vars.q3.int * vars.q3.newCpiINT).toFixed(2)} + {(vars.q3.ls * vars.q3.newCpiLS).toFixed(2)} + {(vars.q3.br * vars.q3.newCpiBR).toFixed(2)} = <strong>{vars.q3.newCycles3.toFixed(2)} × 10<sup>6</sup> cycles</strong></p>
                  
                  <p className={`mt-4 flex items-center font-semibold flex-wrap ${themeVars.stepHeader}`}>
                    <span>Speed-up =</span> 
                    <MathFraction num="Base Cycles" den="New Cycles" isDark={isDark} />
                    <span>=</span>
                    <MathFraction num={vars.q3.baseCycles} den={vars.q3.newCycles3.toFixed(2)} isDark={isDark} />
                    <span>&asymp; <strong>{vars.q3.ansC.toFixed(4)}</strong></span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-10 mb-20 pt-8 border-t border-slate-500/30 flex justify-center">
          <button 
            onClick={verifyAnswers}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-xl transition-colors w-full sm:w-auto shadow-md"
          >
            Verify All Answers
          </button>
        </div>

      </div>
    </div>
  );
};

