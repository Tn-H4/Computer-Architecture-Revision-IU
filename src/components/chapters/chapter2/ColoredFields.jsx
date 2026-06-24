import React from 'react';

export const getFieldColors = (isDark) => isDark ? {
  op:    'bg-pink-900/40 text-pink-300',
  rs:    'bg-emerald-900/40 text-emerald-300',
  rt:    'bg-blue-900/40 text-blue-300',
  rd:    'bg-purple-900/40 text-purple-300',
  shamt: 'bg-amber-900/40 text-amber-300',
  funct: 'bg-pink-900/40 text-pink-300',
  imm:   'bg-rose-900/40 text-rose-300',
} : {
  op:    'bg-pink-50 text-pink-400',
  rs:    'bg-emerald-50 text-emerald-500',
  rt:    'bg-blue-50 text-blue-400',
  rd:    'bg-purple-50 text-purple-400',
  shamt: 'bg-amber-50 text-amber-500',
  funct: 'bg-pink-50 text-pink-400',
  imm:   'bg-rose-50 text-rose-400',
};

export const ColoredInstruction = ({ q, revealedObj, prefix, parentRevealKey, isDark }) => {
  const isRev = (field) => revealedObj[`${prefix}_${field}`] || (parentRevealKey && revealedObj[parentRevealKey]);
  const fieldColors = getFieldColors(isDark);
  const colorize = (field, text) => (
    <span className={`transition-all duration-300 ${isRev(field) ? fieldColors[field] : `${isDark ? 'text-slate-200' : 'text-slate-700'} opacity-90`}`}>
        {text}
      </span>
  );
  if (q.type === 'R') {
    if (['sll', 'srl'].includes(q.n)) return <>{colorize('funct', q.n)} {colorize('rd', q.rdName)}, {colorize('rt', q.rtName)}, {colorize('shamt', q.shamt)}</>;
    return <>{colorize('funct', q.n)} {colorize('rd', q.rdName)}, {colorize('rs', q.rsName)}, {colorize('rt', q.rtName)}</>;
  } else {
    if (['lw', 'sw'].includes(q.n)) return <>{colorize('op', q.n)} {colorize('rt', q.rtName)}, {colorize('imm', q.imm)}({colorize('rs', q.rsName)})</>;
    return <>{colorize('op', q.n)} {colorize('rt', q.rtName)}, {colorize('rs', q.rsName)}, {colorize('imm', q.imm)}</>;
  }
};

export const ColoredBinary = ({ q, revealedObj, prefix, parentRevealKey, isDark }) => {
  const isRev = (field) => revealedObj[`${prefix}_${field}`] || (parentRevealKey && revealedObj[parentRevealKey]);
  const fieldColors = getFieldColors(isDark);
  const colorize = (field, text) => (
    <span className={`transition-all duration-300 ${isRev(field) ? fieldColors[field] : `${isDark ? 'text-slate-300' : 'text-slate-600'}`}`}>
        {text}
      </span>
  );
  const binBlock = (num, bits) => (num >>> 0).toString(2).padStart(bits, '0');

  if (q.type === 'R') {
    return (
      <div className="flex gap-1 md:gap-2 justify-center">
        {colorize('op', binBlock(q.ans.op, 6))}
        {colorize('rs', binBlock(q.ans.rs, 5))}
        {colorize('rt', binBlock(q.ans.rt, 5))}
        {colorize('rd', binBlock(q.ans.rd, 5))}
        {colorize('shamt', binBlock(q.ans.shamt, 5))}
        {colorize('funct', binBlock(q.ans.funct, 6))}
      </div>
    );
  } else {
    return (
      <div className="flex gap-1 md:gap-2 justify-center">
        {colorize('op', binBlock(q.ans.op, 6))}
        {colorize('rs', binBlock(q.ans.rs, 5))}
        {colorize('rt', binBlock(q.ans.rt, 5))}
        {colorize('imm', binBlock(q.ans.imm, 16))}
      </div>
    );
  }
};

