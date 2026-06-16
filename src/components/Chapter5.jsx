import React, { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';

// --- ICONS & HELPER COMPONENTS ---

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
    <path d="m21 2-9.6 9.6"></path>
    <circle cx="7.5" cy="15.5" r="5.5"></circle>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const DiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <circle cx="15.5" cy="15.5" r="1.5"></circle>
    <circle cx="15.5" cy="8.5" r="1.5"></circle>
    <circle cx="8.5" cy="15.5" r="1.5"></circle>
  </svg>
);

const MathFraction = ({ num, den, isDark }) => (
  <span className="inline-flex flex-col items-center justify-center align-middle mx-2 text-base">
    <span className={`border-b pb-0.5 px-2 ${isDark ? 'border-emerald-400' : 'border-emerald-600'}`}>{num}</span>
    <span className="pt-0.5 px-2">{den}</span>
  </span>
);

// --- RANDOMIZATION ENGINE ---

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateVariables = () => {
  // Common
  const wordSize = 4; // bytes per word
  const addressBits = 32;

  // Q1 Variables (Direct Mapped)
  const q1CacheSizeKB = pick([4, 8, 16, 32]);
  const q1BlockSizeWords = pick([4, 8, 16]);
  
  const q1CacheSizeBytes = q1CacheSizeKB * 1024;
  const q1BlockSizeBytes = q1BlockSizeWords * wordSize;
  const q1NumBlocks = q1CacheSizeBytes / q1BlockSizeBytes;
  const q1OffsetBits = Math.log2(q1BlockSizeBytes);
  const q1IndexBits = Math.log2(q1NumBlocks);
  const q1TagBits = addressBits - q1IndexBits - q1OffsetBits;
  const q1TotalBits = q1NumBlocks * ((q1BlockSizeWords * 32) + q1TagBits + 1);

  // Q2 Variables (Set Associative)
  const q2NWay = pick([2, 4, 8]);
  const q2CacheSizeKB = pick([8, 16, 32, 64]);
  const q2BlockSizeWords = pick([4, 8, 16]);

  const q2CacheSizeBytes = q2CacheSizeKB * 1024;
  const q2BlockSizeBytes = q2BlockSizeWords * wordSize;
  const q2TotalBlocks = q2CacheSizeBytes / q2BlockSizeBytes;
  const q2NumSets = q2TotalBlocks / q2NWay;
  const q2OffsetBits = Math.log2(q2BlockSizeBytes);
  const q2IndexBits = Math.log2(q2NumSets);
  const q2TagBits = addressBits - q2IndexBits - q2OffsetBits;
  const q2TotalBits = q2TotalBlocks * ((q2BlockSizeWords * 32) + q2TagBits + 1);

  // Q3 Variables (Fully Associative)
  const q3CacheSizeKB = pick([4, 8, 16, 32]);
  const q3BlockSizeWords = pick([4, 8, 16]);
  
  const q3CacheSizeBytes = q3CacheSizeKB * 1024;
  const q3BlockSizeBytes = q3BlockSizeWords * wordSize;
  const q3NumBlocks = q3CacheSizeBytes / q3BlockSizeBytes;
  const q3OffsetBits = Math.log2(q3BlockSizeBytes);
  const q3IndexBits = 0; // Fully associative has no index
  const q3TagBits = addressBits - q3OffsetBits;
  const q3TotalBits = q3NumBlocks * ((q3BlockSizeWords * 32) + q3TagBits + 1);

  return {
    q1: { cacheSize: q1CacheSizeKB, blockWords: q1BlockSizeWords, cacheBytes: q1CacheSizeBytes, blockBytes: q1BlockSizeBytes, ansBlocks: q1NumBlocks, ansOffset: q1OffsetBits, ansIndex: q1IndexBits, ansTag: q1TagBits, ansTotalBits: q1TotalBits },
    q2: { nWay: q2NWay, cacheSize: q2CacheSizeKB, blockWords: q2BlockSizeWords, cacheBytes: q2CacheSizeBytes, blockBytes: q2BlockSizeBytes, totalBlocks: q2TotalBlocks, ansSets: q2NumSets, ansOffset: q2OffsetBits, ansIndex: q2IndexBits, ansTag: q2TagBits, ansTotalBits: q2TotalBits },
    q3: { cacheSize: q3CacheSizeKB, blockWords: q3BlockSizeWords, cacheBytes: q3CacheSizeBytes, blockBytes: q3BlockSizeBytes, ansBlocks: q3NumBlocks, ansOffset: q3OffsetBits, ansIndex: q3IndexBits, ansTag: q3TagBits, ansTotalBits: q3TotalBits }
  };
};

// --- MAIN COMPONENT ---

const Chapter5 = () => {
  const { theme } = useDiagramStore();
  
  const [mode, setMode] = useState('practice');
  const [activeTab, setActiveTab] = useState('direct');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vars, setVars] = useState(generateVariables());
  
  const [answers, setAnswers] = useState({ 
    q1a: '', q1bTag: '', q1bIndex: '', q1bOffset: '', q1c: '',
    q2a: '', q2bTag: '', q2bIndex: '', q2bOffset: '', q2c: '',
    q3a: '', q3bTag: '', q3bIndex: '', q3bOffset: '', q3c: ''
  });
  
  const [scores, setScores] = useState({ 
    q1a: null, q1bTag: null, q1bIndex: null, q1bOffset: null, q1c: null,
    q2a: null, q2bTag: null, q2bIndex: null, q2bOffset: null, q2c: null,
    q3a: null, q3bTag: null, q3bIndex: null, q3bOffset: null, q3c: null
  });
  
  const [revealed, setRevealed] = useState({ 
    q1a: false, q1b: false, q1c: false,
    q2a: false, q2b: false, q2c: false,
    q3a: false, q3b: false, q3c: false
  });

  const TARGET_ANSWERS = {
    q1a: { value: vars.q1.ansBlocks, type: 'number', tolerance: 0 },
    q1bTag: { value: vars.q1.ansTag, type: 'number', tolerance: 0 },
    q1bIndex: { value: vars.q1.ansIndex, type: 'number', tolerance: 0 },
    q1bOffset: { value: vars.q1.ansOffset, type: 'number', tolerance: 0 },
    q1c: { value: vars.q1.ansTotalBits, type: 'number', tolerance: 0 },
    
    q2a: { value: vars.q2.ansSets, type: 'number', tolerance: 0 },
    q2bTag: { value: vars.q2.ansTag, type: 'number', tolerance: 0 },
    q2bIndex: { value: vars.q2.ansIndex, type: 'number', tolerance: 0 },
    q2bOffset: { value: vars.q2.ansOffset, type: 'number', tolerance: 0 },
    q2c: { value: vars.q2.ansTotalBits, type: 'number', tolerance: 0 },

    q3a: { value: vars.q3.ansBlocks, type: 'number', tolerance: 0 },
    q3bTag: { value: vars.q3.ansTag, type: 'number', tolerance: 0 },
    q3bIndex: { value: vars.q3.ansIndex, type: 'number', tolerance: 0 },
    q3bOffset: { value: vars.q3.ansOffset, type: 'number', tolerance: 0 },
    q3c: { value: vars.q3.ansTotalBits, type: 'number', tolerance: 0 }
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
    setAnswers({ 
      q1a: '', q1bTag: '', q1bIndex: '', q1bOffset: '', q1c: '',
      q2a: '', q2bTag: '', q2bIndex: '', q2bOffset: '', q2c: '',
      q3a: '', q3bTag: '', q3bIndex: '', q3bOffset: '', q3c: ''
    });
    setScores({ 
      q1a: null, q1bTag: null, q1bIndex: null, q1bOffset: null, q1c: null,
      q2a: null, q2bTag: null, q2bIndex: null, q2bOffset: null, q2c: null,
      q3a: null, q3bTag: null, q3bIndex: null, q3bOffset: null, q3c: null
    });
    setIsSubmitted(false);
    setRevealed({ 
      q1a: false, q1b: false, q1c: false, 
      q2a: false, q2b: false, q2c: false,
      q3a: false, q3b: false, q3c: false 
    });
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
      const num = parseFloat(input);
      if (isNaN(num)) return false;
      return Math.abs(num - target.value) <= target.tolerance;
    };

    setScores({
      q1a: checkAnswer(answers.q1a, TARGET_ANSWERS.q1a),
      q1bTag: checkAnswer(answers.q1bTag, TARGET_ANSWERS.q1bTag),
      q1bIndex: checkAnswer(answers.q1bIndex, TARGET_ANSWERS.q1bIndex),
      q1bOffset: checkAnswer(answers.q1bOffset, TARGET_ANSWERS.q1bOffset),
      q1c: checkAnswer(answers.q1c, TARGET_ANSWERS.q1c),

      q2a: checkAnswer(answers.q2a, TARGET_ANSWERS.q2a),
      q2bTag: checkAnswer(answers.q2bTag, TARGET_ANSWERS.q2bTag),
      q2bIndex: checkAnswer(answers.q2bIndex, TARGET_ANSWERS.q2bIndex),
      q2bOffset: checkAnswer(answers.q2bOffset, TARGET_ANSWERS.q2bOffset),
      q2c: checkAnswer(answers.q2c, TARGET_ANSWERS.q2c),

      q3a: checkAnswer(answers.q3a, TARGET_ANSWERS.q3a),
      q3bTag: checkAnswer(answers.q3bTag, TARGET_ANSWERS.q3bTag),
      q3bIndex: checkAnswer(answers.q3bIndex, TARGET_ANSWERS.q3bIndex),
      q3bOffset: checkAnswer(answers.q3bOffset, TARGET_ANSWERS.q3bOffset),
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
    tabActive: isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
    tabInactive: isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
  };

  return (
    <div className={`h-screen w-full overflow-y-auto flex flex-col items-center p-6 md:p-10 pb-40 md:pb-40 transition-colors duration-300 ${themeVars.containerBg}`}>
      
      <div className="w-full max-w-6xl">
        
        {/* Header & Mode Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Chapter 5: Cache Memory</h1>
          </div>
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

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('direct')} className={`px-4 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${activeTab === 'direct' ? themeVars.tabActive : themeVars.tabInactive}`}>
            1. Direct-Mapped
          </button>
          <button onClick={() => setActiveTab('associative')} className={`px-4 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${activeTab === 'associative' ? themeVars.tabActive : themeVars.tabInactive}`}>
            2. Set Associative
          </button>
          <button onClick={() => setActiveTab('fully')} className={`px-4 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${activeTab === 'fully' ? themeVars.tabActive : themeVars.tabInactive}`}>
            3. Fully Associative
          </button>
        </div>


        {/* ==================== EXERCISE 1: DIRECT-MAPPED ==================== */}
        {activeTab === 'direct' && (
          <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-8 ${themeVars.cardBg}`}>
            <div className="mb-8 space-y-3 text-lg">
              <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 1: Direct-Mapped Cache</h2>
              <p>Consider a direct-mapped cache memory with a <strong>32-bit</strong> memory address.</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Cache Data Size = <strong>{vars.q1.cacheSize} KB</strong></li>
                <li>Block Size = <strong>{vars.q1.blockWords} words</strong></li>
                <li><em>Assume 1 word = 4 bytes</em></li>
              </ul>
            </div>

            <div className="space-y-10 text-lg">
              
              {/* Q1 Part A */}
              <div>
                <p className="font-semibold mb-4">a) What is the number of blocks in the cache?</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" value={answers.q1a} onChange={(e) => handleInputChange(e, 'q1a')} placeholder="Blocks"
                    className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                  {isSubmitted && scores.q1a && <CheckIcon />}
                  {isSubmitted && !scores.q1a && <CrossIcon />}
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q1a')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q1a && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q1a.value}</span>}
                    </div>
                  )}
                </div>
                {revealed.q1a && (
                  <div className={`mt-4 p-5 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Block size = {vars.q1.blockWords} words × 4 bytes/word = <strong>{vars.q1.blockBytes} bytes</strong></li>
                      <li>Cache size = {vars.q1.cacheSize} KB × 1024 = <strong>{vars.q1.cacheBytes} bytes</strong></li>
                    </ul>
                    <p className="mt-3 flex items-center flex-wrap">
                      <span>Number of Blocks =</span> <MathFraction num="Cache Size" den="Block Size" isDark={isDark} /> <span>=</span> <MathFraction num={vars.q1.cacheBytes} den={vars.q1.blockBytes} isDark={isDark} /> <span>= <strong>{vars.q1.ansBlocks} blocks</strong></span>
                    </p>
                  </div>
                )}
              </div>

              {/* Q1 Part B */}
              <div>
                <p className="font-semibold mb-4">b) What is the format of the memory address? (Enter number of bits for each)</p>
                <div className="flex items-center gap-x-4 gap-y-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tag:</span>
                    <input type="number" value={answers.q1bTag} onChange={(e) => handleInputChange(e, 'q1bTag')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q1bTag && <CheckIcon />}
                    {isSubmitted && !scores.q1bTag && <CrossIcon />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Index:</span>
                    <input type="number" value={answers.q1bIndex} onChange={(e) => handleInputChange(e, 'q1bIndex')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q1bIndex && <CheckIcon />}
                    {isSubmitted && !scores.q1bIndex && <CrossIcon />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Offset:</span>
                    <input type="number" value={answers.q1bOffset} onChange={(e) => handleInputChange(e, 'q1bOffset')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q1bOffset && <CheckIcon />}
                    {isSubmitted && !scores.q1bOffset && <CrossIcon />}
                  </div>
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q1b')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q1b && (
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Tag: {TARGET_ANSWERS.q1bTag.value}</span>
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Index: {TARGET_ANSWERS.q1bIndex.value}</span>
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Offset: {TARGET_ANSWERS.q1bOffset.value}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {revealed.q1b && (
                  <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <ul className="list-disc pl-6 space-y-3">
                      <li><strong>Offset:</strong> Block Size = {vars.q1.blockBytes} bytes = 2<sup>{vars.q1.ansOffset}</sup> &rarr; Offset = <strong>{vars.q1.ansOffset} bits</strong></li>
                      <li><strong>Index:</strong> Number of Blocks = {vars.q1.ansBlocks} = 2<sup>{vars.q1.ansIndex}</sup> &rarr; Index = <strong>{vars.q1.ansIndex} bits</strong></li>
                      <li><strong>Tag:</strong> 32 - {vars.q1.ansIndex} (Index) - {vars.q1.ansOffset} (Offset) = <strong>{vars.q1.ansTag} bits</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Q1 Part C */}
              <div>
                <p className="font-semibold mb-4">c) What is the total number of bits required to implement this cache? <br/><span className="text-sm font-normal italic">(Assume 1 valid bit per block and no other overhead bits)</span></p>
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" value={answers.q1c} onChange={(e) => handleInputChange(e, 'q1c')} placeholder="Total Bits"
                    className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                  {isSubmitted && scores.q1c && <CheckIcon />}
                  {isSubmitted && !scores.q1c && <CrossIcon />}
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q1c')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q1c && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q1c.value.toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                {revealed.q1c && (
                  <div className={`mt-4 p-5 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <p>Total Bits = Total Blocks × (Data Bits per Block + Tag Bits + Valid Bit)</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Total Blocks = <strong>{vars.q1.ansBlocks}</strong></li>
                      <li>Data Bits per Block = {vars.q1.blockWords} words × 32 bits/word = <strong>{vars.q1.blockWords * 32} bits</strong></li>
                      <li>Tag Bits = <strong>{vars.q1.ansTag} bits</strong></li>
                      <li>Valid Bit = <strong>1 bit</strong></li>
                    </ul>
                    <p className="mt-3">
                      Total Cache Bits = {vars.q1.ansBlocks} × ({vars.q1.blockWords * 32} + {vars.q1.ansTag} + 1)<br/>
                      Total Cache Bits = {vars.q1.ansBlocks} × ({(vars.q1.blockWords * 32) + vars.q1.ansTag + 1}) = <strong>{vars.q1.ansTotalBits.toLocaleString()} bits</strong>
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================== EXERCISE 2: SET ASSOCIATIVE ==================== */}
        {activeTab === 'associative' && (
          <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-8 ${themeVars.cardBg}`}>
            <div className="mb-8 space-y-3 text-lg">
              <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 2: Set Associative Cache</h2>
              <p>Consider an <strong>{vars.q2.nWay}-way</strong> set associative cache memory with a <strong>32-bit</strong> memory address.</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Cache Data Size = <strong>{vars.q2.cacheSize} KB</strong></li>
                <li>Block Size = <strong>{vars.q2.blockWords} words</strong></li>
                <li><em>Assume 1 word = 4 bytes</em></li>
              </ul>
            </div>

            <div className="space-y-10 text-lg">
              
              {/* Q2 Part A */}
              <div>
                <p className="font-semibold mb-4">a) What is the number of sets in the cache?</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" value={answers.q2a} onChange={(e) => handleInputChange(e, 'q2a')} placeholder="Sets"
                    className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                  {isSubmitted && scores.q2a && <CheckIcon />}
                  {isSubmitted && !scores.q2a && <CrossIcon />}
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q2a')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q2a && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q2a.value}</span>}
                    </div>
                  )}
                </div>
                {revealed.q2a && (
                  <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <ul className="list-disc pl-6 space-y-2 mb-3">
                      <li>Block size = {vars.q2.blockWords} words × 4 = <strong>{vars.q2.blockBytes} bytes</strong></li>
                      <li>Cache size = {vars.q2.cacheSize} KB × 1024 = <strong>{vars.q2.cacheBytes} bytes</strong></li>
                      <li>Total Blocks = {vars.q2.cacheBytes} / {vars.q2.blockBytes} = <strong>{vars.q2.totalBlocks} blocks</strong></li>
                    </ul>
                    <p className="flex items-center flex-wrap">
                      <span>Number of Sets =</span> <MathFraction num="Total Blocks" den="N-way" isDark={isDark} /> <span>=</span> <MathFraction num={vars.q2.totalBlocks} den={vars.q2.nWay} isDark={isDark} /> <span>= <strong>{vars.q2.ansSets} sets</strong></span>
                    </p>
                  </div>
                )}
              </div>

              {/* Q2 Part B */}
              <div>
                <p className="font-semibold mb-4">b) What is the format of the memory address? (Enter number of bits for each)</p>
                <div className="flex items-center gap-x-4 gap-y-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tag:</span>
                    <input type="number" value={answers.q2bTag} onChange={(e) => handleInputChange(e, 'q2bTag')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q2bTag && <CheckIcon />}
                    {isSubmitted && !scores.q2bTag && <CrossIcon />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Index:</span>
                    <input type="number" value={answers.q2bIndex} onChange={(e) => handleInputChange(e, 'q2bIndex')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q2bIndex && <CheckIcon />}
                    {isSubmitted && !scores.q2bIndex && <CrossIcon />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Offset:</span>
                    <input type="number" value={answers.q2bOffset} onChange={(e) => handleInputChange(e, 'q2bOffset')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q2bOffset && <CheckIcon />}
                    {isSubmitted && !scores.q2bOffset && <CrossIcon />}
                  </div>
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q2b')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q2b && (
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Tag: {TARGET_ANSWERS.q2bTag.value}</span>
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Index: {TARGET_ANSWERS.q2bIndex.value}</span>
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Offset: {TARGET_ANSWERS.q2bOffset.value}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {revealed.q2b && (
                  <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <ul className="list-disc pl-6 space-y-3">
                      <li><strong>Offset:</strong> Block Size = {vars.q2.blockBytes} bytes = 2<sup>{vars.q2.ansOffset}</sup> &rarr; Offset = <strong>{vars.q2.ansOffset} bits</strong></li>
                      <li><strong>Index:</strong> Number of Sets = {vars.q2.ansSets} = 2<sup>{vars.q2.ansIndex}</sup> &rarr; Index = <strong>{vars.q2.ansIndex} bits</strong></li>
                      <li><strong>Tag:</strong> 32 - {vars.q2.ansIndex} (Index) - {vars.q2.ansOffset} (Offset) = <strong>{vars.q2.ansTag} bits</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Q2 Part C */}
              <div>
                <p className="font-semibold mb-4">c) What is the total number of bits required to implement this cache? <br/><span className="text-sm font-normal italic">(Assume 1 valid bit per block and no other overhead bits)</span></p>
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" value={answers.q2c} onChange={(e) => handleInputChange(e, 'q2c')} placeholder="Total Bits"
                    className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                  {isSubmitted && scores.q2c && <CheckIcon />}
                  {isSubmitted && !scores.q2c && <CrossIcon />}
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q2c')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q2c && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q2c.value.toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                {revealed.q2c && (
                  <div className={`mt-4 p-5 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <p>Total Bits = Total Blocks × (Data Bits per Block + Tag Bits + Valid Bit)</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Total Blocks = <strong>{vars.q2.totalBlocks}</strong></li>
                      <li>Data Bits per Block = {vars.q2.blockWords} words × 32 bits/word = <strong>{vars.q2.blockWords * 32} bits</strong></li>
                      <li>Tag Bits = <strong>{vars.q2.ansTag} bits</strong></li>
                      <li>Valid Bit = <strong>1 bit</strong></li>
                    </ul>
                    <p className="mt-3">
                      Total Cache Bits = {vars.q2.totalBlocks} × ({vars.q2.blockWords * 32} + {vars.q2.ansTag} + 1)<br/>
                      Total Cache Bits = {vars.q2.totalBlocks} × ({(vars.q2.blockWords * 32) + vars.q2.ansTag + 1}) = <strong>{vars.q2.ansTotalBits.toLocaleString()} bits</strong>
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================== EXERCISE 3: FULLY ASSOCIATIVE ==================== */}
        {activeTab === 'fully' && (
          <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-8 ${themeVars.cardBg}`}>
            <div className="mb-8 space-y-3 text-lg">
              <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 3: Fully Associative Cache</h2>
              <p>Consider a <strong>Fully Associative</strong> cache memory with a <strong>32-bit</strong> memory address.</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Cache Data Size = <strong>{vars.q3.cacheSize} KB</strong></li>
                <li>Block Size = <strong>{vars.q3.blockWords} words</strong></li>
                <li><em>Assume 1 word = 4 bytes</em></li>
              </ul>
            </div>

            <div className="space-y-10 text-lg">
              
              {/* Q3 Part A */}
              <div>
                <p className="font-semibold mb-4">a) What is the total number of blocks in the cache?</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" value={answers.q3a} onChange={(e) => handleInputChange(e, 'q3a')} placeholder="Blocks"
                    className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                  {isSubmitted && scores.q3a && <CheckIcon />}
                  {isSubmitted && !scores.q3a && <CrossIcon />}
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q3a')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q3a && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q3a.value}</span>}
                    </div>
                  )}
                </div>
                {revealed.q3a && (
                  <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <ul className="list-disc pl-6 space-y-2 mb-3">
                      <li>Block size = {vars.q3.blockWords} words × 4 = <strong>{vars.q3.blockBytes} bytes</strong></li>
                      <li>Cache size = {vars.q3.cacheSize} KB × 1024 = <strong>{vars.q3.cacheBytes} bytes</strong></li>
                    </ul>
                    <p className="flex items-center flex-wrap">
                      <span>Total Blocks =</span> <MathFraction num="Cache Size" den="Block Size" isDark={isDark} /> <span>=</span> <MathFraction num={vars.q3.cacheBytes} den={vars.q3.blockBytes} isDark={isDark} /> <span>= <strong>{vars.q3.ansBlocks} blocks</strong></span>
                    </p>
                  </div>
                )}
              </div>

              {/* Q3 Part B */}
              <div>
                <p className="font-semibold mb-4">b) What is the format of the memory address? (Enter number of bits for each)</p>
                <div className="flex items-center gap-x-4 gap-y-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tag:</span>
                    <input type="number" value={answers.q3bTag} onChange={(e) => handleInputChange(e, 'q3bTag')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q3bTag && <CheckIcon />}
                    {isSubmitted && !scores.q3bTag && <CrossIcon />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Index:</span>
                    <input type="number" value={answers.q3bIndex} onChange={(e) => handleInputChange(e, 'q3bIndex')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q3bIndex && <CheckIcon />}
                    {isSubmitted && !scores.q3bIndex && <CrossIcon />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Offset:</span>
                    <input type="number" value={answers.q3bOffset} onChange={(e) => handleInputChange(e, 'q3bOffset')} className={`w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                    {isSubmitted && scores.q3bOffset && <CheckIcon />}
                    {isSubmitted && !scores.q3bOffset && <CrossIcon />}
                  </div>
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q3b')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q3b && (
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Tag: {TARGET_ANSWERS.q3bTag.value}</span>
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Index: {TARGET_ANSWERS.q3bIndex.value}</span>
                          <span className={`px-2 py-1 rounded-md border font-bold text-sm ${themeVars.yellowBox}`}>Offset: {TARGET_ANSWERS.q3bOffset.value}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {revealed.q3b && (
                  <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <ul className="list-disc pl-6 space-y-3">
                      <li><strong>Offset:</strong> Block Size = {vars.q3.blockBytes} bytes = 2<sup>{vars.q3.ansOffset}</sup> &rarr; Offset = <strong>{vars.q3.ansOffset} bits</strong></li>
                      <li><strong>Index:</strong> In a Fully Associative cache, there are no sets to index. A block can go anywhere. Therefore, Index = <strong>0 bits</strong></li>
                      <li><strong>Tag:</strong> 32 - 0 (Index) - {vars.q3.ansOffset} (Offset) = <strong>{vars.q3.ansTag} bits</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Q3 Part C */}
              <div>
                <p className="font-semibold mb-4">c) What is the total number of bits required to implement this cache? <br/><span className="text-sm font-normal italic">(Assume 1 valid bit per block and no other overhead bits)</span></p>
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" value={answers.q3c} onChange={(e) => handleInputChange(e, 'q3c')} placeholder="Total Bits"
                    className={`w-40 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeVars.inputBg}`} />
                  {isSubmitted && scores.q3c && <CheckIcon />}
                  {isSubmitted && !scores.q3c && <CrossIcon />}
                  {shouldShowKey && (
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => toggleReveal('q3c')} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
                      {revealed.q3c && <span className={`px-3 py-1 rounded-md border font-bold ${themeVars.yellowBox}`}>{TARGET_ANSWERS.q3c.value.toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                {revealed.q3c && (
                  <div className={`mt-4 p-5 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>
                    <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                    <p>Total Bits = Total Blocks × (Data Bits per Block + Tag Bits + Valid Bit)</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Total Blocks = <strong>{vars.q3.ansBlocks}</strong></li>
                      <li>Data Bits per Block = {vars.q3.blockWords} words × 32 bits/word = <strong>{vars.q3.blockWords * 32} bits</strong></li>
                      <li>Tag Bits = <strong>{vars.q3.ansTag} bits</strong></li>
                      <li>Valid Bit = <strong>1 bit</strong></li>
                    </ul>
                    <p className="mt-3">
                      Total Cache Bits = {vars.q3.ansBlocks} × ({vars.q3.blockWords * 32} + {vars.q3.ansTag} + 1)<br/>
                      Total Cache Bits = {vars.q3.ansBlocks} × ({(vars.q3.blockWords * 32) + vars.q3.ansTag + 1}) = <strong>{vars.q3.ansTotalBits.toLocaleString()} bits</strong>
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

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

export default Chapter5;