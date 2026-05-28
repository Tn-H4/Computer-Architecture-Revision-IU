import React, { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';

// --- ICONS ---
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

// --- IEEE-754 HELPERS ---
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Format a 23-bit fraction in groups of 4 for readability: e.g. "100_1100_0000_..."
const formatFraction = (fracBits) => {
  // fracBits is a 23-char binary string
  const groups = [];
  for (let i = 0; i < 23; i += 4) {
    groups.push(fracBits.slice(i, i + 4));
  }
  return groups.join('_');
};

// Format an 8-bit exponent in groups of 4
const formatExponent = (expBits) => {
  return expBits.slice(0, 4) + '_' + expBits.slice(4);
};

// Convert IEEE-754 single-precision hex to its components and decimal value
const parseIEEE754 = (hexStr) => {
  const bits = parseInt(hexStr, 16);
  const sign = (bits >>> 31) & 1;
  const expRaw = (bits >>> 23) & 0xFF;
  const fracBits = bits & 0x7FFFFF;
  const fracBinStr = fracBits.toString(2).padStart(23, '0');

  // Compute fraction value (mantissa - 1)
  let fracVal = 0;
  for (let i = 0; i < 23; i++) {
    if (fracBinStr[i] === '1') fracVal += Math.pow(2, -(i + 1));
  }

  // Which powers of 2 contribute to the fraction
  const fracPowers = [];
  for (let i = 0; i < 23; i++) {
    if (fracBinStr[i] === '1') fracPowers.push(-(i + 1));
  }

  const expVal = expRaw - 127;
  const decimalVal = Math.pow(-1, sign) * (1 + fracVal) * Math.pow(2, expVal);

  const expBinStr = expRaw.toString(2).padStart(8, '0');

  return {
    sign,
    expRaw,
    expVal,
    fracVal,
    fracPowers,
    fracBinStr,
    expBinStr,
    decimalVal,
    hexStr: '0x' + hexStr.toUpperCase(),
  };
};

// Convert a positive decimal number to IEEE-754 single-precision hex
const toIEEE754 = (num) => {
  const sign = num < 0 ? 1 : 0;
  const absNum = Math.abs(num);

  // Find exponent: largest power of 2 ≤ absNum
  const expVal = Math.floor(Math.log2(absNum));
  const expRaw = expVal + 127;

  // Fraction: (absNum / 2^expVal) - 1
  const fracVal = absNum / Math.pow(2, expVal) - 1;

  // Build 23-bit fraction string
  let remaining = fracVal;
  let fracBinStr = '';
  for (let i = 0; i < 23; i++) {
    remaining *= 2;
    if (remaining >= 1) { fracBinStr += '1'; remaining -= 1; }
    else { fracBinStr += '0'; }
  }

  const fracBits = parseInt(fracBinStr, 2);
  const bits = (sign << 31) | (expRaw << 23) | fracBits;
  const hexStr = (bits >>> 0).toString(16).toUpperCase().padStart(8, '0');

  // Which powers of 2 in the fraction
  const fracPowers = [];
  for (let i = 0; i < 23; i++) {
    if (fracBinStr[i] === '1') fracPowers.push(-(i + 1));
  }

  return {
    sign,
    expRaw,
    expVal,
    fracVal,
    fracPowers,
    fracBinStr,
    expBinStr: expRaw.toString(2).padStart(8, '0'),
    hexStr: '0x' + hexStr,
    bits,
    fracBits,
  };
};

// Pool of "nice" IEEE-754 numbers that have clean binary fractions
const IEEE754_POOL = [
  // Format: { decimal, hex } — only numbers with exact binary representation
  { decimal: 12.75,    hex: '414C0000' },
  { decimal: 6.5,      hex: '40D00000' },
  { decimal: 0.75,     hex: '3F400000' },
  { decimal: 1.5,      hex: '3FC00000' },
  { decimal: 3.25,     hex: '40500000' },
  { decimal: 5.5,      hex: '40B00000' },
  { decimal: 11.25,    hex: '41340000' },
  { decimal: 7.125,    hex: '40E40000' },
  { decimal: 2.75,     hex: '40300000' },
  { decimal: 14.5,     hex: '41680000' },
  { decimal: 0.375,    hex: '3EC00000' },
  { decimal: 9.0,      hex: '41100000' },
  { decimal: 25.75,    hex: '41CE0000' },
  { decimal: 0.1875,   hex: '3E400000' },
  { decimal: 100.0,    hex: '42C80000' },
];

// --- VARIABLE GENERATOR ---
const generateVariables = () => {
  // Q1: Hex → Decimal  (pick a random entry)
  const q1Entry = pick(IEEE754_POOL);
  const q1 = parseIEEE754(q1Entry.hex);

  // Q2: Decimal → Hex  (pick a DIFFERENT random entry)
  let q2Entry;
  do { q2Entry = pick(IEEE754_POOL); } while (q2Entry.hex === q1Entry.hex);
  const q2 = toIEEE754(q2Entry.decimal);

  return { q1: { ...q1, inputHex: q1Entry.hex }, q2: { ...q2, inputDecimal: q2Entry.decimal } };
};

// Format fraction powers as a math expression, e.g. "2⁻¹ + 2⁻⁴ + 2⁻⁵"
const formatPowers = (powers) => {
  if (powers.length === 0) return '0';
  return powers.map(p => `2^${p}`).join(' + ');
};
const superscript = (n) => {
  const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map(c => map[c] || c).join('');
};

// --- MAIN COMPONENT ---
const Chapter3 = () => {
  const { theme } = useDiagramStore();

  const [mode, setMode] = useState('practice');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vars, setVars] = useState(generateVariables());

  const emptyAnswers = {
    q1s: '', q1exp: '', q1frac: '', q1decimal: '',
    q2s: '', q2exp: '', q2expraw: '', q2frac: '', q2hex: '',
  };
  const emptyScores = {
    q1s: null, q1exp: null, q1frac: null, q1decimal: null,
    q2s: null, q2exp: null, q2expraw: null, q2frac: null, q2hex: null,
  };
  const emptyRevealed = {
    q1s: false, q1exp: false, q1frac: false, q1decimal: false,
    q2s: false, q2exp: false, q2expraw: false, q2frac: false, q2hex: false,
  };

  const [answers, setAnswers] = useState(emptyAnswers);
  const [scores, setScores] = useState(emptyScores);
  const [revealed, setRevealed] = useState(emptyRevealed);

  const TARGET_ANSWERS = {
    // Q1: hex → decimal
    q1s:       { value: vars.q1.sign.toString(),               type: 'string' },
    q1exp:     { value: vars.q1.expRaw.toString(),             type: 'string' },
    q1frac:    { value: vars.q1.fracVal.toString(),            type: 'number', tolerance: 0.0001 },
    q1decimal: { value: vars.q1.decimalVal,                    type: 'number', tolerance: 0.01 },
    // Q2: decimal → hex
    q2s:       { value: vars.q2.sign.toString(),               type: 'string' },
    q2exp:     { value: vars.q2.expVal.toString(),             type: 'string' },
    q2expraw:  { value: vars.q2.expRaw.toString(),             type: 'string' },
    q2frac:    { value: vars.q2.fracBinStr,                    type: 'binary' },
    q2hex:     { value: vars.q2.hexStr,                        type: 'hex' },
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsSubmitted(false);
    setRevealed(emptyRevealed);
  };

  const handleRandomize = () => {
    setVars(generateVariables());
    setAnswers(emptyAnswers);
    setScores(emptyScores);
    setIsSubmitted(false);
    setRevealed(emptyRevealed);
  };

  const handleInputChange = (e, field) => {
    setAnswers({ ...answers, [field]: e.target.value });
    setIsSubmitted(false);
  };

  const toggleReveal = (field) => {
    setRevealed({ ...revealed, [field]: !revealed[field] });
  };

  const normalizeHex = (s) => s.trim().toLowerCase().replace(/^0x/, '');

  const checkAnswer = (input, target) => {
    const inp = input.trim();
    if (!inp) return false;
    if (target.type === 'string') {
      return inp.toLowerCase() === target.value.toString().toLowerCase();
    }
    if (target.type === 'binary') {
      // Accept with or without underscores/spaces
      return inp.replace(/[_\s]/g, '') === target.value.replace(/[_\s]/g, '');
    }
    if (target.type === 'hex') {
      return normalizeHex(inp) === normalizeHex(target.value);
    }
    // number
    const num = parseFloat(inp);
    if (isNaN(num)) return false;
    return Math.abs(num - target.value) / (Math.abs(target.value) + 1e-9) <= (target.tolerance || 0.01);
  };

  const verifyAnswers = () => {
    const newScores = {};
    Object.keys(TARGET_ANSWERS).forEach(k => {
      newScores[k] = checkAnswer(answers[k] || '', TARGET_ANSWERS[k]);
    });
    setScores(newScores);
    setIsSubmitted(true);
  };

  const isDark = theme === 'dark';
  const shouldShowKey = mode === 'practice' || isSubmitted;

  const themeVars = {
    containerBg:  isDark ? 'bg-slate-900 text-slate-200'                         : 'bg-slate-50 text-slate-800',
    cardBg:       isDark ? 'bg-slate-800 border-slate-700'                        : 'bg-white border-slate-300',
    inputBg:      isDark ? 'bg-slate-900 border-slate-600 text-white'             : 'bg-slate-50 border-slate-300 text-slate-900',
    answerKeyBg:  isDark ? 'bg-emerald-900/20 border-emerald-700/40 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-800',
    title:        isDark ? 'text-blue-400'   : 'text-blue-600',
    stepHeader:   isDark ? 'text-emerald-400': 'text-emerald-700',
    yellowBox:    isDark ? 'text-amber-400 bg-amber-900/40 border-transparent'    : 'text-amber-700 bg-amber-100 border-amber-300',
    blueBox:      isDark ? 'bg-blue-900/20 border-blue-800 text-slate-200'        : 'bg-blue-50 border-blue-200 text-slate-800',
    blueBoxText:  isDark ? 'text-blue-300'   : 'text-blue-800',
    greenBox:     isDark ? 'bg-emerald-900/20 border-emerald-800 text-slate-200'  : 'bg-emerald-50 border-emerald-200 text-slate-800',
    greenBoxText: isDark ? 'text-emerald-400': 'text-emerald-800',
    code:         isDark ? 'bg-slate-700 text-slate-200'                          : 'bg-slate-200 text-slate-800',
    monoBox:      isDark ? 'bg-slate-900 border-slate-600 text-blue-300'          : 'bg-slate-100 border-slate-300 text-blue-700',
  };

  // Reusable input + check + reveal row
  const renderInputRow = (field, placeholder, width = 'w-44', suffix = null) => (
    <div className="flex items-center gap-4 flex-wrap">
      <input
        type="text"
        value={answers[field]}
        onChange={(e) => handleInputChange(e, field)}
        placeholder={placeholder}
        className={`${width} px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${themeVars.inputBg}`}
      />
      {suffix && <span className="font-medium">{suffix}</span>}
      {isSubmitted && scores[field] === true  && <CheckIcon />}
      {isSubmitted && scores[field] === false && <CrossIcon />}
      {shouldShowKey && (
        <div className="flex items-center gap-2 ml-2">
          <button onClick={() => toggleReveal(field)} className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer">
            <KeyIcon />
          </button>
          {revealed[field] && (
            <span className={`px-3 py-1 rounded-md border font-bold font-mono ${themeVars.yellowBox}`}>
              {TARGET_ANSWERS[field].value.toString()}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // ---- Q1 step-by-step explanation ----
  const q1 = vars.q1;
  const q1FracDisplay = formatFraction(q1.fracBinStr);
  const q1ExpDisplay  = formatExponent(q1.expBinStr);
  const q1PowersExpr  = q1.fracPowers.length
    ? q1.fracPowers.map(p => <span key={p}>2<sup>{p}</sup></span>).reduce((a, b) => <>{a} + {b}</>)
    : <span>0</span>;

  // ---- Q2 step-by-step explanation ----
  const q2 = vars.q2;
  const q2Decimal = q2.inputDecimal;
  // Build a nice binary representation of the integer+fraction parts for step 2
  const q2IntPart  = Math.floor(q2Decimal);
  const q2FracPart = q2Decimal - q2IntPart;
  const q2IntBin   = q2IntPart.toString(2);
  // fractional binary expansion (up to 8 digits for display)
  let q2FracBinDisplay = '';
  let rem = q2FracPart;
  for (let i = 0; i < 8; i++) { rem *= 2; q2FracBinDisplay += Math.floor(rem); rem -= Math.floor(rem); }
  const q2FullBin  = `${q2IntBin}.${q2FracBinDisplay}`;
  const q2FracDisplay = formatFraction(q2.fracBinStr);

  return (
    <div className={`h-screen w-full overflow-y-auto flex flex-col items-center p-6 md:p-10 pb-40 transition-colors duration-300 ${themeVars.containerBg}`}>
      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold">Chapter 3: IEEE-754 Floating Point</h1>
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
              >Practice Mode</button>
              <button
                onClick={() => handleModeChange('test')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'test' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
              >Test Mode</button>
            </div>
          </div>
        </div>

        {/* ==================== QUESTION 1: Hex → Decimal ==================== */}
        <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-8 ${themeVars.cardBg}`}>
          <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 1: Hex → Decimal</h2>
          <p className="text-lg mb-6">
            What is the decimal value of the IEEE-754 single-precision floating point number{' '}
            <code className={`font-mono font-bold px-2 py-1 rounded ${themeVars.monoBox}`}>
              0x{q1.inputHex}
            </code>?
          </p>

          {/* IEEE-754 bit layout visual */}
          <div className={`mb-8 p-4 rounded-xl border font-mono text-sm overflow-x-auto ${themeVars.blueBox}`}>
            <div className={`text-xs font-bold mb-1 ${themeVars.blueBoxText}`}>Single-Precision (32-bit) Layout:</div>
            <div className="flex gap-0 text-center">
              <div className="flex flex-col items-center">
                <div className={`px-2 py-1 border-r ${isDark ? 'bg-pink-900/40 text-pink-300 border-slate-600' : 'bg-pink-50 text-pink-600 border-slate-300'} font-bold`}>S</div>
                <div className="text-xs opacity-60 mt-1">1 bit</div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`px-4 py-1 border-r ${isDark ? 'bg-amber-900/40 text-amber-300 border-slate-600' : 'bg-amber-50 text-amber-600 border-slate-300'} font-bold`}>Exponent</div>
                <div className="text-xs opacity-60 mt-1">8 bits</div>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className={`px-4 py-1 w-full ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600'} font-bold`}>Fraction (Mantissa)</div>
                <div className="text-xs opacity-60 mt-1">23 bits</div>
              </div>
            </div>
            <div className="mt-3 text-xs opacity-70">
              Formula: X = (−1)<sup>S</sup> × (1 + Fraction) × 2<sup>Exponent − 127</sup>
            </div>
          </div>

          <div className="space-y-10 text-lg">

            {/* Q1a: Sign bit */}
            <div>
              <p className="font-semibold mb-4">a) What is the <span className="text-pink-500">Sign</span> bit (S)?</p>
              {renderInputRow('q1s', '0 or 1', 'w-32')}
              {revealed.q1s && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Convert <code className="font-mono">0x{q1.inputHex}</code> to binary.</p>
                  <p className="mt-2">The <strong>most significant bit (bit 31)</strong> is the sign bit.</p>
                  <p className="mt-2">
                    Binary: <code className="font-mono">{q1.sign}{q1.expBinStr}{q1.fracBinStr}</code>
                  </p>
                  <p className={`mt-2 font-semibold ${themeVars.stepHeader}`}>
                    S = <strong>{q1.sign}</strong> → {q1.sign === 0 ? 'Positive number' : 'Negative number'}
                  </p>
                </div>
              )}
            </div>

            {/* Q1b: Exponent */}
            <div>
              <p className="font-semibold mb-4">b) What is the <span className="text-amber-500">Exponent</span> field value (in decimal)?</p>
              {renderInputRow('q1exp', 'decimal', 'w-36')}
              {revealed.q1exp && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Exponent bits (bits 30–23): <code className="font-mono">{q1.expBinStr}</code></p>
                  <p className="mt-2">Formatted: <code className="font-mono">{q1ExpDisplay}</code></p>
                  <p className={`mt-2 font-semibold ${themeVars.stepHeader}`}>
                    Exponent = {q1ExpDisplay}<sub>2</sub> = <strong>{q1.expRaw}</strong>
                  </p>
                  <p className="mt-2 text-sm opacity-80">
                    (Actual exponent used in formula: {q1.expRaw} − 127 = <strong>{q1.expVal}</strong>)
                  </p>
                </div>
              )}
            </div>

            {/* Q1c: Fraction */}
            <div>
              <p className="font-semibold mb-4">c) What is the <span className="text-emerald-500">Fraction</span> value (as a decimal number)?</p>
              {renderInputRow('q1frac', 'e.g. 0.59375', 'w-44')}
              {revealed.q1frac && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Fraction bits (bits 22–0): <code className="font-mono">{q1FracDisplay}</code><sub>2</sub></p>
                  <p className="mt-3">
                    F = {q1.fracPowers.length > 0
                      ? q1.fracPowers.map((p, i) => (
                          <span key={p}>
                            {i > 0 && ' + '}
                            2<sup>{p}</sup>
                          </span>
                        ))
                      : '0'
                    }
                  </p>
                  <p className="mt-1">
                    F = {q1.fracPowers.length > 0
                      ? q1.fracPowers.map((p, i) => (
                          <span key={p}>
                            {i > 0 && ' + '}
                            {Math.pow(2, p)}
                          </span>
                        ))
                      : '0'
                    } = <strong>{q1.fracVal.toFixed(6)}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Q1d: Final decimal value */}
            <div>
              <p className="font-semibold mb-4">d) What is the final <strong>decimal value</strong> X?</p>
              {renderInputRow('q1decimal', 'decimal value', 'w-44')}
              {revealed.q1decimal && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Apply the IEEE-754 formula:</p>
                  <p className="mt-2">
                    X = (−1)<sup>{q1.sign}</sup> × (1 + {q1.fracVal.toFixed(6)}) × 2<sup>{q1.expRaw} − 127</sup>
                  </p>
                  <p className="mt-2">
                    X = (−1)<sup>{q1.sign}</sup> × {(1 + q1.fracVal).toFixed(6)} × 2<sup>{q1.expVal}</sup>
                  </p>
                  <p className="mt-2">
                    X = {q1.sign === 0 ? '' : '−'}{(1 + q1.fracVal).toFixed(6)} × {Math.pow(2, q1.expVal)}
                  </p>
                  <p className={`mt-3 font-bold text-xl ${themeVars.stepHeader}`}>
                    X = <strong>{q1.decimalVal}</strong>
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ==================== QUESTION 2: Decimal → Hex ==================== */}
        <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg mb-10 ${themeVars.cardBg}`}>
          <h2 className={`text-2xl font-bold mb-4 ${themeVars.title}`}>Question 2: Decimal → IEEE-754 Hex</h2>
          <p className="text-lg mb-6">
            What is the IEEE-754 single-precision representation of{' '}
            <code className={`font-mono font-bold px-2 py-1 rounded ${themeVars.monoBox}`}>
              {q2Decimal}
            </code>?
          </p>

          <div className="space-y-10 text-lg">

            {/* Q2a: Sign bit */}
            <div>
              <p className="font-semibold mb-4">a) What is the <span className="text-pink-500">Sign</span> bit (S)?</p>
              {renderInputRow('q2s', '0 or 1', 'w-32')}
              {revealed.q2s && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>{q2Decimal} is a <strong>{q2.sign === 0 ? 'positive' : 'negative'}</strong> number.</p>
                  <p className={`mt-2 font-semibold ${themeVars.stepHeader}`}>S = <strong>{q2.sign}</strong></p>
                </div>
              )}
            </div>

            {/* Q2b: Exponent (actual, before bias) */}
            <div>
              <p className="font-semibold mb-4">
                b) Convert {q2Decimal} to binary. What is the <span className="text-amber-500">actual exponent</span> (the power of 2)?
              </p>
              {renderInputRow('q2exp', 'e.g. 3', 'w-32')}
              {revealed.q2exp && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>Convert {q2Decimal} to binary:</p>
                  <p className="mt-2">
                    {q2Decimal} = <code className="font-mono">{q2FullBin}</code><sub>2</sub>
                  </p>
                  <p className="mt-2">
                    = 1.{q2FullBin.split('.').slice(1).join('').slice(0, 8)} × 2<sup>{q2.expVal}</sup>
                  </p>
                  <p className={`mt-2 font-semibold ${themeVars.stepHeader}`}>
                    Actual exponent = <strong>{q2.expVal}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Q2c: Stored exponent (biased) */}
            <div>
              <p className="font-semibold mb-4">
                c) What is the <span className="text-amber-500">stored (biased) Exponent</span> field value?
                <span className="text-base font-normal opacity-70 ml-2">(Add the bias of 127)</span>
              </p>
              {renderInputRow('q2expraw', 'decimal', 'w-36')}
              {revealed.q2expraw && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>
                    Stored Exponent = Actual Exponent + Bias = {q2.expVal} + 127 = <strong>{q2.expRaw}</strong>
                  </p>
                  <p className="mt-2">
                    In binary: <code className="font-mono">{formatExponent(q2.expBinStr)}</code><sub>2</sub>
                  </p>
                </div>
              )}
            </div>

            {/* Q2d: Fraction bits */}
            <div>
              <p className="font-semibold mb-4">
                d) What are the <span className="text-emerald-500">Fraction</span> bits? (23-bit binary string)
              </p>
              {renderInputRow('q2frac', '23-bit binary', 'w-64')}
              {revealed.q2frac && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p>
                    In normalized form: 1.<strong>{q2FracDisplay}</strong> × 2<sup>{q2.expVal}</sup>
                  </p>
                  <p className="mt-2">
                    The fraction field stores only the bits <em>after</em> the implicit leading 1:
                  </p>
                  <p className={`mt-2 font-mono font-bold ${themeVars.stepHeader}`}>
                    {q2FracDisplay}<sub>2</sub>
                  </p>
                  <p className="mt-2 text-sm opacity-80">
                    (Padded to 23 bits with trailing zeros: <code className="font-mono">{q2.fracBinStr}</code>)
                  </p>
                </div>
              )}
            </div>

            {/* Q2e: Final hex */}
            <div>
              <p className="font-semibold mb-4">
                e) What is the final <strong>IEEE-754 hex representation</strong>?
              </p>
              {renderInputRow('q2hex', '0x...', 'w-44')}
              {revealed.q2hex && (
                <div className={`mt-4 p-5 rounded-xl border text-base ${themeVars.answerKeyBg}`}>
                  <h4 className={`font-bold mb-2 ${themeVars.stepHeader}`}>Step-by-Step Solution:</h4>
                  <p><strong>Step 1:</strong> Assemble all 32 bits:</p>
                  <div className={`mt-3 p-3 rounded-lg border font-mono text-sm overflow-x-auto ${themeVars.blueBox}`}>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded ${isDark ? 'bg-pink-900/40 text-pink-300' : 'bg-pink-50 text-pink-600'}`}>
                        {q2.sign}
                      </span>
                      <span className={`px-2 py-1 rounded ${isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
                        {q2.expBinStr}
                      </span>
                      <span className={`px-2 py-1 rounded ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                        {q2.fracBinStr}
                      </span>
                    </div>
                    <div className="mt-2 text-xs opacity-70">
                      S={q2.sign} | Exp={q2.expBinStr} ({q2.expRaw}) | Frac={q2FracDisplay}
                    </div>
                  </div>
                  <p className="mt-4"><strong>Step 2:</strong> Group into 4-bit nibbles and convert to hex:</p>
                  <p className="mt-2 font-mono text-sm">
                    {(q2.sign.toString() + q2.expBinStr + q2.fracBinStr).match(/.{4}/g)?.join(' ')}
                  </p>
                  <p className={`mt-3 font-bold text-xl ${themeVars.stepHeader}`}>
                    {q2Decimal} = <strong>{q2.hexStr}</strong><sub>IEEE-754</sub>
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

export default Chapter3;