import React, { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';

// --- ICONS & HELPER COMPONENTS ---
const KeyIcon = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
    <path d="m21 2-9.6 9.6"></path>
    <circle cx="7.5" cy="15.5" r="5.5"></circle>
  </svg>
);

const CheckIcon = ({ size = 28 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm flex-shrink-0">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CrossIcon = ({ size = 28 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm flex-shrink-0">
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

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    <line x1="12" y1="6" x2="16" y2="6"></line>
    <line x1="12" y1="10" x2="16" y2="10"></line>
  </svg>
);

// --- REFERENCE TABLE DATA ---
const REGISTER_TABLE = [
  ['$zero','0','$t0–$t7','8–15','$gp','28'],
  ['$at','1','$s0–$s7','16–23','$sp','29'],
  ['$v0–$v1','2–3','$t8–$t9','24–25','$fp','30'],
  ['$a0–$a3','4–7','$k0–$k1','26–27','$ra','31'],
];
const FUNCT_TABLE = [
  ['add','0x20 (32)','sub','0x22 (34)'],
  ['and','0x24 (36)','or','0x25 (37)'],
  ['nor','0x28 (39)','jr','0x08 (8)'],
  ['sll','0x00 (0)','srl','0x02 (2)'],
  ['slt','0x2A (42)','sltu','0x2B (43)'],
];
const OPCODE_TABLE = [
  ['addi','0x08 (8)','addiu','0x09 (9)'],
  ['lbu','0x24 (36)','lhu','0x25 (37)'],
  ['lb','0x20 (32)','lh','0x21 (33)'],
  ['lw','0x23 (35)','sw','0x2B (43)'],
  ['sb','0x28 (40)','sh','0x29 (41)'],
  ['slti','0x0A (10)','sltiu','0x0B (11)'],
  ['andi','0x0C (12)','ori','0x0D (13)'],
  ['beq','0x04 (4)','bne','0x05 (5)'],
];

const RefTableModal = ({ onClose, isDark }) => {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  const m = {
    overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4',
    panel: `relative rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`,
    header: `sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b rounded-t-2xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`,
    title: `text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`,
    closeBtn: `p-1.5 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`,
    sectionTitle: `text-base font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`,
    tableWrap: `overflow-x-auto rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`,
    thead: `font-semibold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`,
    th: `px-4 py-2.5 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`,
    tdText: `px-4 py-2 font-mono border-b ${isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-100'}`,
    rowEven: isDark ? 'bg-blue-900/10' : 'bg-blue-50/60',
    rowOdd: isDark ? 'bg-slate-900' : 'bg-white',
  };
  return (
    <div onClick={handleBackdrop} className={m.overlay} style={{ animation: 'fadeIn 0.15s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>
      <div className={m.panel}>
        <div className={m.header}>
          <h2 className={m.title}>MIPS Reference Tables</h2>
          <button onClick={onClose} className={m.closeBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-8">
          {/* Register Numbers */}
          <div>
            <h3 className={m.sectionTitle}>Register Numbers</h3>
            <div className={m.tableWrap}>
              <table className="w-full text-sm text-left">
                <thead className={m.thead}><tr>{['Register','Number','Register','Number','Register','Number'].map((h,i) => <th key={i} className={m.th}>{h}</th>)}</tr></thead>
                <tbody>{REGISTER_TABLE.map((row, i) => <tr key={i} className={i%2===0?m.rowEven:m.rowOdd}>{row.map((cell,j) => <td key={j} className={m.tdText}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
          {/* Function Fields */}
          <div>
            <h3 className={m.sectionTitle}>R-Format Function Fields</h3>
            <div className={m.tableWrap}>
              <table className="w-full text-sm text-left">
                <thead className={m.thead}><tr>{['Instruction','Function field','Instruction','Function field'].map((h,i) => <th key={i} className={m.th}>{h}</th>)}</tr></thead>
                <tbody>{FUNCT_TABLE.map((row, i) => <tr key={i} className={i%2===0?m.rowEven:m.rowOdd}>{row.map((cell,j) => <td key={j} className={m.tdText}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
          {/* Opcode Fields */}
          <div>
            <h3 className={m.sectionTitle}>I-Format Opcode Fields</h3>
            <div className={m.tableWrap}>
              <table className="w-full text-sm text-left">
                <thead className={m.thead}><tr>{['Instruction','Opcode field','Instruction','Opcode field'].map((h,i) => <th key={i} className={m.th}>{h}</th>)}</tr></thead>
                <tbody>{OPCODE_TABLE.map((row, i) => <tr key={i} className={i%2===0?m.rowEven:m.rowOdd}>{row.map((cell,j) => <td key={j} className={m.tdText}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- RANDOMIZATION & FORMATTING HELPERS ---
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const toHex = (num, padding) => '0x' + (num >>> 0).toString(16).toUpperCase().padStart(padding, '0');
const signExt16 = (val) => (val & 0x8000) ? (val | 0xFFFF0000) : val;
const signExt8 = (val) => (val & 0x80) ? (val | 0xFFFFFF00) : val;
const binBlock = (num, bits) => (num >>> 0).toString(2).padStart(bits, '0');
const formatBin = (num) => (num >>> 0).toString(2).padStart(32, '0').match(/.{1,4}/g).join(' ');

// MIPS Registers for Machine Code
const REGISTERS = {
  '$t0': 8, '$t1': 9, '$t2': 10, '$t3': 11, '$t4': 12, '$t5': 13, '$t6': 14, '$t7': 15,
  '$s0': 16, '$s1': 17, '$s2': 18, '$s3': 19, '$s4': 20, '$s5': 21, '$s6': 22, '$s7': 23
};

// --- EXTERNAL COMPONENTS FOR COLOR HIGHLIGHTING ---
const getFieldColors = (isDark) => isDark ? {
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

const ColoredInstruction = ({ q, revealedObj, prefix, parentRevealKey, isDark }) => {
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

const ColoredBinary = ({ q, revealedObj, prefix, parentRevealKey, isDark }) => {
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

// --- VARIABLE GENERATOR ---
const generateVariables = () => {
  // 1. Basic Memory Operations
  const memory = {};
  for (let i = 8; i <= 15; i++) { memory[i] = Math.floor(Math.random() * 256); }
  const getWord = (addr) => (memory[addr] << 24) | (memory[addr+1] << 16) | (memory[addr+2] << 8) | memory[addr+3];
  const getHalf = (addr) => (memory[addr] << 8) | memory[addr+1];

  const memAns = {
    a: toHex(getWord(8), 8), b: toHex(getWord(12), 8), c: toHex(signExt16(getHalf(12)), 8),
    d: toHex(signExt8(memory[11]), 8), e: toHex(0xCA, 2), f: toHex(0xCE, 2), g: 'Error'
  };
  const memExpl = {
    a: "lw loads a full 32-bit word (4 bytes) starting at the base address ($t0 = 8). It reads addresses 8, 9, 10, and 11.",
    b: "lw loads a 32-bit word starting at address 12 ($t0 + 4). It reads addresses 12, 13, 14, and 15.",
    c: `lh loads a 16-bit halfword (2 bytes) from address 12 ($t0 + 4). In Big-Endian, it reads bytes 12 and 13. The value is then sign-extended to 32 bits to fill the register.`,
    d: `lb loads an 8-bit byte from address 11 ($t0 + 3). It reads a single byte and sign-extends it to 32 bits.`,
    e: "sw (Store Word) writes 4 bytes to memory at address 8. In Big-Endian format, the MOST significant byte of $s0 (0xCA) is placed at the lowest address (Addr 8).",
    f: "sb (Store Byte) writes a single byte to memory at address 12. It takes the LEAST significant byte of $s0 (0xCE) and stores it.",
    g: "lh requires the memory address to be halfword-aligned (a multiple of 2). Address 15 ($t0 + 7) is odd, which triggers an alignment error."
  };

  // 2. Array Memory Operations
  const arr_v1 = pick([1024, 2024, 3048, 4096]); const arr_v2 = pick([10, 20, 30, 40]); const arr_v3 = pick([-2, -4, -6, -8]);
  const arr_s0 = signExt16(arr_v1 & 0xFFFF); const arr_s1 = signExt16(arr_v2 & 0xFFFF);
  const arr_s3 = arr_s0 + arr_s1;
  const arrAns = { s0: arr_s0.toString(), s1: arr_s1.toString(), s4: arr_v3.toString() };
  const arrExpl = {
    s0: `The integer ${arr_v1} takes 4 bytes at offset 0-3. lh at offset 2 loads the lower 2 bytes (0x${toHex(arr_v1 & 0xFFFF, 4).replace('0x','')}). Sign-extended to decimal: ${arr_s0}.`,
    s1: `The integer ${arr_v2} takes bytes 4-7. lh at offset 6 loads the lower 2 bytes (0x${toHex(arr_v2 & 0xFFFF, 4).replace('0x','')}). Sign-extended to decimal: ${arr_s1}.`,
    s4: `add combines them to ${arr_s3}. sb stores the lowest byte of $s3 at offset 8 (first byte of 3rd integer). lh at offset 10 cleanly loads the lower 2 bytes of the third integer (${arr_v3}), resulting in ${arr_v3}.`
  };

  // 3. Bitwise Logic
  const bit_v0 = pick([0x12345678, 0x87654321, 0x0F0F0F0F]);
  const bit_v1 = pick([0xCAFEFACE, 0xDEADBEEF, 0xBADF00D5]);
  const bit_shamt = pick([4, 8, 12]);
  const bit_imm = pick([2020, 1010, 4040]);
  const bitAns = {
    a1: toHex(bit_v0 << bit_shamt, 8),
    a2: toHex(bit_v0 & bit_v1, 8),
    a3: toHex(bit_v0 | bit_v1, 8),
    a4: toHex(bit_v0 & bit_imm, 8) 
  };
  const bitExpl = {
    a1: `Shift Left Logical (sll) shifts bits left by ${bit_shamt}.\n\n  ${formatBin(bit_v0)} ($s0)\n  ${formatBin(bit_v0 << bit_shamt)} (Result)`,
    a2: `Bitwise AND (&) returns 1 only if BOTH bits are 1.\n\n  ${formatBin(bit_v0)} ($s0)\n& ${formatBin(bit_v1)} ($s1)\n  ${'-'.repeat(39)}\n  ${formatBin(bit_v0 & bit_v1)} (Result)`,
    a3: `Bitwise OR (|) returns 1 if AT LEAST ONE bit is 1.\n\n  ${formatBin(bit_v0)} ($s0)\n| ${formatBin(bit_v1)} ($s1)\n  ${'-'.repeat(39)}\n  ${formatBin(bit_v0 | bit_v1)} (Result)`,
    a4: `AND Immediate (andi) ZERO-EXTENDS the 16-bit imm to 32 bits.\nImm ${bit_imm} = 0x${toHex(bit_imm, 4).replace('0x','')}\n\n  ${formatBin(bit_v0)} ($s0)\n& ${formatBin(bit_imm)} (Imm)\n  ${'-'.repeat(39)}\n  ${formatBin(bit_v0 & bit_imm)} (Result)`
  };

  // 4. Sequences
  const seq_v0 = pick([0xAAAAAAAA, 0xF00DD00D]);
  const seq_v1 = pick([0x12345678, 0x11111111]);
  const seq_sh1 = pick([4, 8]);
  const seq_sh3 = pick([3, 4]);
  
  const seqTemp1 = seq_v0 << seq_sh1;
  const seqTemp3 = seq_v0 >>> seq_sh3;
  
  const seqAns = {
    s1: toHex(seqTemp1 | seq_v1, 8),
    s2: toHex(seqTemp1 & 0xFFFE, 8),
    s3: toHex(seqTemp3 & 0xFFEF, 8)
  };
  const seqExpl = {
    s1: `Step 1 (sll): Shift $t0 left by ${seq_sh1}\nTemp = ${formatBin(seqTemp1)}\n\nStep 2 (or): Temp OR $t1\n  ${formatBin(seqTemp1)}\n| ${formatBin(seq_v1)} ($t1)\n  ${'-'.repeat(39)}\n  ${formatBin(seqTemp1 | seq_v1)}`,
    s2: `Step 1 (sll): Shift $t0 left by ${seq_sh1}\nTemp = ${formatBin(seqTemp1)}\n\nStep 2 (andi): andi ZERO-EXTENDS the immediate.\n-2 is 0xFFFE in 16-bit, extended to 0x0000FFFE.\n  ${formatBin(seqTemp1)}\n& ${formatBin(0xFFFE)} (0x0000FFFE)\n  ${'-'.repeat(39)}\n  ${formatBin(seqTemp1 & 0xFFFE)}`,
    s3: `Step 1 (srl): Shift $t0 right by ${seq_sh3} (filling left with 0s)\nTemp = ${formatBin(seqTemp3)}\n\nStep 2 (andi): andi ZERO-EXTENDS 0xFFEF to 0x0000FFEF.\n  ${formatBin(seqTemp3)}\n& ${formatBin(0xFFEF)} (0x0000FFEF)\n  ${'-'.repeat(39)}\n  ${formatBin(seqTemp3 & 0xFFEF)}`
  };

  // 5. Forward Machine Code (Randomized R or I Format)
  const fwd_type = pick(['R_arith', 'R_shift', 'I_mem', 'I_arith']);
  let mcAns = {};

  if (fwd_type === 'R_arith') {
    const op = pick([{f: 32, n: 'add'}, {f: 34, n: 'sub'}, {f: 36, n: 'and'}, {f: 37, n: 'or'}]);
    const rsName = pick(Object.keys(REGISTERS)); const rtName = pick(Object.keys(REGISTERS)); const rdName = pick(Object.keys(REGISTERS));
    const mcNum = (0 << 26) | (REGISTERS[rsName] << 21) | (REGISTERS[rtName] << 16) | (REGISTERS[rdName] << 11) | (0 << 6) | op.f;
    mcAns = { type: 'R', n: op.n, rsName, rtName, rdName, op: 0, rs: REGISTERS[rsName], rt: REGISTERS[rtName], rd: REGISTERS[rdName], shamt: 0, funct: op.f, machineCode: toHex(mcNum, 8) };
  } else if (fwd_type === 'R_shift') {
    const op = pick([{f: 0, n: 'sll'}, {f: 2, n: 'srl'}]);
    const rtName = pick(Object.keys(REGISTERS)); const rdName = pick(Object.keys(REGISTERS)); const shamt = pick([2, 4, 8, 12, 16]);
    const mcNum = (0 << 26) | (0 << 21) | (REGISTERS[rtName] << 16) | (REGISTERS[rdName] << 11) | (shamt << 6) | op.f;
    mcAns = { type: 'R', n: op.n, rsName: '$zero', rtName, rdName, shamt, op: 0, rs: 0, rt: REGISTERS[rtName], rd: REGISTERS[rdName], funct: op.f, machineCode: toHex(mcNum, 8) };
  } else if (fwd_type === 'I_mem') {
    const op = pick([{op: 35, n: 'lw'}, {op: 43, n: 'sw'}]);
    const rsName = pick(Object.keys(REGISTERS)); const rtName = pick(Object.keys(REGISTERS)); const imm = pick([4, 8, 12, 16, 100, -4]);
    const mcNum = (op.op << 26) | (REGISTERS[rsName] << 21) | (REGISTERS[rtName] << 16) | (imm & 0xFFFF);
    mcAns = { type: 'I', n: op.n, rsName, rtName, imm, op: op.op, rs: REGISTERS[rsName], rt: REGISTERS[rtName], machineCode: toHex(mcNum >>> 0, 8) };
  } else {
    const op = {op: 8, n: 'addi'};
    const rsName = pick(Object.keys(REGISTERS)); const rtName = pick(Object.keys(REGISTERS)); const imm = pick([4, 8, 12, 16, 100, -4]);
    const mcNum = (op.op << 26) | (REGISTERS[rsName] << 21) | (REGISTERS[rtName] << 16) | (imm & 0xFFFF);
    mcAns = { type: 'I', n: op.n, rsName, rtName, imm, op: op.op, rs: REGISTERS[rsName], rt: REGISTERS[rtName], machineCode: toHex(mcNum >>> 0, 8) };
  }

  // 6. Reverse Machine Code (Enhanced for Color Coding)
  const sh_op = pick([{f: 0, n: 'sll'}, {f: 2, n: 'srl'}]);
  const sh_rtName = pick(Object.keys(REGISTERS)); const sh_rdName = pick(Object.keys(REGISTERS)); const sh_shamt = pick([2, 4, 8, 12, 16]);
  const sh_mcNum = (0 << 26) | (0 << 21) | (REGISTERS[sh_rtName] << 16) | (REGISTERS[sh_rdName] << 11) | (sh_shamt << 6) | sh_op.f;
  const rev1 = { id: 'rev1', type: 'R', n: sh_op.n, rtName: sh_rtName, rdName: sh_rdName, shamt: sh_shamt, hint: 'Opcode 0 is R-format. Shift instructions don\'t use `rs`.', hex: toHex(sh_mcNum, 8), binStr: `${binBlock(0, 6)} ${binBlock(0, 5)} ${binBlock(REGISTERS[sh_rtName], 5)} ${binBlock(REGISTERS[sh_rdName], 5)} ${binBlock(sh_shamt, 5)} ${binBlock(sh_op.f, 6)}`, ans: { op: 0, rs: 0, rt: REGISTERS[sh_rtName], rd: REGISTERS[sh_rdName], shamt: sh_shamt, funct: sh_op.f, inst: `${sh_op.n} ${sh_rdName}, ${sh_rtName}, ${sh_shamt}` } };

  const ar_op = pick([{f: 32, n: 'add'}, {f: 34, n: 'sub'}, {f: 36, n: 'and'}, {f: 37, n: 'or'}]);
  const ar_rsName = pick(Object.keys(REGISTERS)); const ar_rtName = pick(Object.keys(REGISTERS)); const ar_rdName = pick(Object.keys(REGISTERS));
  const ar_mcNum = (0 << 26) | (REGISTERS[ar_rsName] << 21) | (REGISTERS[ar_rtName] << 16) | (REGISTERS[ar_rdName] << 11) | (0 << 6) | ar_op.f;
  const rev2 = { id: 'rev2', type: 'R', n: ar_op.n, rsName: ar_rsName, rtName: ar_rtName, rdName: ar_rdName, hint: 'Opcode 0 is R-format. Check the funct field.', hex: toHex(ar_mcNum, 8), binStr: `${binBlock(0, 6)} ${binBlock(REGISTERS[ar_rsName], 5)} ${binBlock(REGISTERS[ar_rtName], 5)} ${binBlock(REGISTERS[ar_rdName], 5)} ${binBlock(0, 5)} ${binBlock(ar_op.f, 6)}`, ans: { op: 0, rs: REGISTERS[ar_rsName], rt: REGISTERS[ar_rtName], rd: REGISTERS[ar_rdName], shamt: 0, funct: ar_op.f, inst: `${ar_op.n} ${ar_rdName}, ${ar_rsName}, ${ar_rtName}` } };

  const i_op = pick([{op: 35, n: 'lw', mem: true}, {op: 43, n: 'sw', mem: true}, {op: 8, n: 'addi', mem: false}]);
  const i_rsName = pick(Object.keys(REGISTERS)); const i_rtName = pick(Object.keys(REGISTERS)); const i_imm = pick([4, 8, 12, 16, 20, 100]);
  const i_mcNum = (i_op.op << 26) | (REGISTERS[i_rsName] << 21) | (REGISTERS[i_rtName] << 16) | i_imm;
  const rev3 = { id: 'rev3', type: 'I', n: i_op.n, rsName: i_rsName, rtName: i_rtName, imm: i_imm, hint: `Opcode ${i_op.op} is I-format. Last 16 bits = immediate.`, hex: toHex(i_mcNum, 8), binStr: `${binBlock(i_op.op, 6)} ${binBlock(REGISTERS[i_rsName], 5)} ${binBlock(REGISTERS[i_rtName], 5)} ${binBlock(i_imm, 16)}`, ans: { op: i_op.op, rs: REGISTERS[i_rsName], rt: REGISTERS[i_rtName], imm: i_imm, inst: i_op.mem ? `${i_op.n} ${i_rtName}, ${i_imm}(${i_rsName})` : `${i_op.n} ${i_rtName}, ${i_rsName}, ${i_imm}` } };

  return {
    memoryMap: memory, memAns, memExpl, 
    arrVars: { v1: arr_v1, v2: arr_v2, v3: arr_v3 }, arrAns, arrExpl,
    bitVars: { v0: bit_v0, v1: bit_v1, shamt: bit_shamt, imm: bit_imm }, bitAns, bitExpl,
    seqVars: { v0: seq_v0, v1: seq_v1, sh1: seq_sh1, sh3: seq_sh3 }, seqAns, seqExpl,
    mcAns, revQuestions: [rev1, rev2, rev3]
  };
};

// --- MAIN COMPONENT ---
const Chapter2 = () => {
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
      ['op', 'rs', 'rt', 'rd', 'shamt', 'funct'].forEach(f => TARGETS[`mc_${f}`] = vars.mcAns[f]);
    } else {
      ['op', 'rs', 'rt', 'imm'].forEach(f => TARGETS[`mc_${f}`] = vars.mcAns[f]);
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

  const renderInput = (id, placeholder, width = "w-40") => (
    <div className="flex items-center gap-3 flex-shrink-0">
      <input type="text" value={answers[id] || ''} onChange={(e) => handleChange(id, e.target.value)} placeholder={placeholder} className={`${width} px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center ${themeVars.inputBg}`} />
      {isSubmitted && (scores[id] ? <CheckIcon /> : <CrossIcon />)}
      {shouldShowKey && (
        <div className="flex items-center gap-2">
          <button onClick={() => toggleReveal(id)} className="p-1.5 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors" title="Reveal Answer"><KeyIcon /></button>
          {revealed[id] && <span className={`px-2 py-1 rounded-md border font-bold font-mono text-sm whitespace-nowrap ${themeVars.yellowBox}`}>{getAnswerDisplay(id)}</span>}
        </div>
      )}
    </div>
  );

  // --- Chapter 4 Datapath Style Machine Code Box ---
  const renderFormatBlock = (prefix, type) => {
    
    const renderFieldCell = (id, label, bits, flexClass, fieldKey) => {
      const fieldColors = getFieldColors(isDark);
  const prefix = id.split('_')[0];
  const parentKey = prefix === 'mc' ? 'mc_hex' : `${prefix}_inst`;
  const isRev = revealed[parentKey];
  const maxLen = Number(bits);

  return (
    <div key={id} className={`${flexClass} flex flex-col border-r last:border-0 relative transition-all duration-300 ${isDark ? 'border-slate-600' : 'border-slate-300'} ${isRev ? fieldColors[fieldKey] : themeVars.inputBg}`}>
      <div className={`py-1 text-center text-[10px] md:text-xs font-bold uppercase tracking-wider border-b ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
        {label} <span className="opacity-60 font-normal">({bits})</span>
      </div>
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
    </div>
  );
};

    if (type === 'R') {
      return (
        <div className={`flex w-full border-2 rounded-xl overflow-hidden shadow-sm my-6 ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
          {renderFieldCell(`${prefix}_op`, 'op', '6', 'flex-[1.2]', 'op')}
          {renderFieldCell(`${prefix}_rs`, 'rs', '5', 'flex-1', 'rs')}
          {renderFieldCell(`${prefix}_rt`, 'rt', '5', 'flex-1', 'rt')}
          {renderFieldCell(`${prefix}_rd`, 'rd', '5', 'flex-1', 'rd')}
          {renderFieldCell(`${prefix}_shamt`, 'shamt', '5', 'flex-1', 'shamt')}
          {renderFieldCell(`${prefix}_funct`, 'funct', '6', 'flex-[1.2]', 'funct')}
        </div>
      );
    } else {
      return (
        <div className={`flex w-full border-2 rounded-xl overflow-hidden shadow-sm my-6 ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
          {renderFieldCell(`${prefix}_op`, 'op', '6', 'flex-[1.2]', 'op')}
          {renderFieldCell(`${prefix}_rs`, 'rs', '5', 'flex-1', 'rs')}
          {renderFieldCell(`${prefix}_rt`, 'rt', '5', 'flex-1', 'rt')}
          {renderFieldCell(`${prefix}_imm`, 'immediate', '16', 'flex-[3.2]', 'imm')}
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
            <div className={`p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
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
                        <div className={`mt-3 p-4 rounded-xl border text-sm md:text-base ${themeVars.answerKeyBg}`}>
                          <strong className="text-emerald-500 dark:text-emerald-400 block mb-1">Step-by-Step Solution:</strong>
                          {vars.memExpl[id]}
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
                        <div className={`mt-3 p-4 rounded-xl border text-sm md:text-base ${themeVars.answerKeyBg}`}>
                          <strong className="text-emerald-500 dark:text-emerald-400 block mb-1">Step-by-Step Solution:</strong>
                          {vars.memExpl[id]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part B: Array Manipulation</h2>
              <p className="mb-4">Assume an array <strong>[{vars.arrVars.v1}, {vars.arrVars.v2}, {vars.arrVars.v3}]</strong> with base address in <code className={themeVars.code}>$t0</code>. Final decimal values?</p>
              <div className={`p-4 rounded-lg font-mono mb-6 ${themeVars.blueBox} inline-block`}>
                lh $s0, 2($t0)<br/>lh $s1, 6($t0)<br/>add $s3, $s1, $s0<br/>sb $s3, 8($t0)<br/>lh $s4, 10($t0)
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-lg">
                {['s0', 's1', 's4'].map(reg => (
                  <div key={reg}>
                    <p className="font-semibold mb-2">${reg} Value:</p>
                    {renderInput(`arr_${reg}`, 'e.g. 1024', 'w-full md:w-40')}
                    {revealed[`arr_${reg}`] && (
                      <div className={`mt-3 p-4 rounded-xl border text-sm md:text-base ${themeVars.answerKeyBg}`}>
                        <strong className="text-emerald-500 dark:text-emerald-400 block mb-1">Explanation:</strong>
                        {vars.arrExpl[reg]}
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
            <div className={`p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part A: Core Logical Operations</h2>
              <p className="mb-6">Assume <code className={themeVars.code}>$s0 = {toHex(vars.bitVars.v0, 8)}</code> and <code className={themeVars.code}>$s1 = {toHex(vars.bitVars.v1, 8)}</code>. What is the value of <code className={themeVars.code}>$s2</code> (in hex)?</p>
              
              <div className="grid md:grid-cols-2 gap-8 text-lg">
                {[
                  { id: 'a1', code: `1. sll $s2, $s0, ${vars.bitVars.shamt}` },
                  { id: 'a2', code: `2. and $s2, $s0, $s1` },
                  { id: 'a3', code: `3. or $s2, $s0, $s1` },
                  { id: 'a4', code: `4. andi $s2, $s0, ${vars.bitVars.imm}` }
                ].map(({ id, code }) => (
                  <div key={id}>
                    <p className="font-mono mb-2">{code}</p>
                    {renderInput(`bit_${id}`, '0x...')}
                    {revealed[`bit_${id}`] && (
                      <div className={`mt-3 p-4 rounded-xl border overflow-x-auto ${themeVars.answerKeyBg}`}>
                        <strong className="text-emerald-500 dark:text-emerald-400 block mb-2 text-sm md:text-base">Binary Breakdown:</strong>
                        <pre className="font-mono text-xs leading-relaxed">{vars.bitExpl[id]}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-8 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part B: Instruction Sequences</h2>
              <p className="mb-6">Find the final value of <code className={themeVars.code}>$t2</code> if <code className={themeVars.code}>$t0 = {toHex(vars.seqVars.v0, 8)}</code> and <code className={themeVars.code}>$t1 = {toHex(vars.seqVars.v1, 8)}</code>.</p>
              
              <div className="grid md:grid-cols-3 gap-6 text-lg">
                {[
                  { id: 's1', title: 'Sequence 1', inst: `sll $t2, $t0, ${vars.seqVars.sh1}\nor $t2, $t2, $t1` },
                  { id: 's2', title: 'Sequence 2', inst: `sll $t2, $t0, ${vars.seqVars.sh1}\nandi $t2, $t2, -2` },
                  { id: 's3', title: 'Sequence 3', inst: `srl $t2, $t0, ${vars.seqVars.sh3}\nandi $t2, $t2, 0xFFEF` }
                ].map(({ id, title, inst }) => (
                  <div key={id} className="flex flex-col">
                    <div className={`p-5 border rounded-xl flex-grow ${themeVars.blueBox}`}>
                      <h3 className="font-bold border-b border-current pb-2 mb-4 opacity-80">{title}</h3>
                      <div className="font-mono mb-6 whitespace-pre-line">{inst}</div>
                      {renderInput(`seq_${id}`, '0x...', 'w-full')}
                    </div>
                    {revealed[`seq_${id}`] && (
                      <div className={`mt-3 p-4 rounded-xl border overflow-x-auto shadow-sm ${themeVars.answerKeyBg}`}>
                        <strong className="text-emerald-500 dark:text-emerald-400 block mb-2 text-sm">Step-by-Step Logic:</strong>
                        <pre className="font-mono text-[11px] md:text-xs leading-relaxed">{vars.seqExpl[id]}</pre>
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
            <div className={`p-6 md:p-10 rounded-2xl border shadow-lg ${themeVars.cardBg}`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Part A: Assembly to Machine Code</h2>
              <p className="mb-4">Translate the following instruction into a 32-bit Machine Code string using the breakdown below.</p>
              
              <div className={`inline-block px-6 py-4 rounded-lg font-mono text-xl md:text-2xl font-bold tracking-wider mb-2 ${themeVars.blueBox}`}>
                <ColoredInstruction q={vars.mcAns} revealedObj={revealed} prefix="mc" parentRevealKey="mc_hex" isDark={isDark} />
              </div>

              {renderFormatBlock('mc', vars.mcAns.type)}
              
              <div className="pt-2 flex flex-col md:flex-row items-start md:items-center gap-4">
                <p className="font-semibold whitespace-nowrap">Final 32-bit Hex:</p>
                {renderInput('mc_hex', '0x...', 'w-48')}
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
                    
                    <div className={`pt-10 pb-8 px-6 md:px-8 border rounded-xl shadow-inner ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      
                      <div className={`inline-block px-4 md:px-6 py-4 rounded-lg font-mono text-xl md:text-2xl font-bold tracking-wider mb-4 ${themeVars.blueBox} shadow-sm border-l-4 border-blue-500`}>
                        <div className="text-center mb-2">{q.hex}</div>
                        <div className="text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.15em]">
                          {/* THIS MAKES THE BINARY CHUNKS GLOW */}
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

export default Chapter2;