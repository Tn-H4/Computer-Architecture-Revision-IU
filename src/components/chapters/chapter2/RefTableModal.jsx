import React from 'react';

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

export default function RefTableModal({ onClose, isDark }) {
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
          <div>
            <h3 className={m.sectionTitle}>Register Numbers</h3>
            <div className={m.tableWrap}>
              <table className="w-full text-sm text-left">
                <thead className={m.thead}><tr>{['Register','Number','Register','Number','Register','Number'].map((h,i) => <th key={i} className={m.th}>{h}</th>)}</tr></thead>
                <tbody>{REGISTER_TABLE.map((row, i) => <tr key={i} className={i%2===0?m.rowEven:m.rowOdd}>{row.map((cell,j) => <td key={j} className={m.tdText}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className={m.sectionTitle}>R-Format Function Fields</h3>
            <div className={m.tableWrap}>
              <table className="w-full text-sm text-left">
                <thead className={m.thead}><tr>{['Instruction','Function field','Instruction','Function field'].map((h,i) => <th key={i} className={m.th}>{h}</th>)}</tr></thead>
                <tbody>{FUNCT_TABLE.map((row, i) => <tr key={i} className={i%2===0?m.rowEven:m.rowOdd}>{row.map((cell,j) => <td key={j} className={m.tdText}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
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
}