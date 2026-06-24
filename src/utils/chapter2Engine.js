import { pick } from './worksheetHelpers.js';

export const toHex = (num, padding) => '0x' + (num >>> 0).toString(16).toUpperCase().padStart(padding, '0');
export const signExt16 = (val) => (val & 0x8000) ? (val | 0xFFFF0000) : val;
export const signExt8 = (val) => (val & 0x80) ? (val | 0xFFFFFF00) : val;
export const binBlock = (num, bits) => (num >>> 0).toString(2).padStart(bits, '0');
export const formatBin = (num) => (num >>> 0).toString(2).padStart(32, '0').match(/.{1,4}/g).join(' ');

// MIPS Registers for Machine Code
export const REGISTERS = {
  '$t0': 8, '$t1': 9, '$t2': 10, '$t3': 11, '$t4': 12, '$t5': 13, '$t6': 14, '$t7': 15,
  '$s0': 16, '$s1': 17, '$s2': 18, '$s3': 19, '$s4': 20, '$s5': 21, '$s6': 22, '$s7': 23
};

export function generateVariables() {
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

