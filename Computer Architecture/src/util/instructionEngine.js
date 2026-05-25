// Map common MIPS registers to their decimal values
const REG_MAP = {
  '$zero': 0, '$at': 1, '$v0': 2, '$v1': 3,
  '$a0': 4, '$a1': 5, '$a2': 6, '$a3': 7,
  '$t0': 8, '$t1': 9, '$t2': 10, '$t3': 11, '$t4': 12, '$t5': 13, '$t6': 14, '$t7': 15,
  '$s0': 16, '$s1': 17, '$s2': 18, '$s3': 19, '$s4': 20, '$s5': 21, '$s6': 22, '$s7': 23,
  '$t8': 24, '$t9': 25, '$k0': 26, '$k1': 27, '$gp': 28, '$sp': 29, '$fp': 30, '$ra': 31
};

// Helper to convert number to padded binary string
const toBin = (num, bits) => (num >>> 0).toString(2).padStart(bits, '0').slice(-bits);

export const parseInstruction = (input) => {
  // Normalize string: lowercase, remove commas
  const cleanInput = input.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = cleanInput.split(' ');
  const opcode = parts[0];

  let rs = '', rt = '', rd = '', imm = '', address = '';

  try {
    if (['add', 'sub'].includes(opcode)) {
      // Format: op rd, rs, rt
      rd = parts[1]; rs = parts[2]; rt = parts[3];
    } else if (['addi'].includes(opcode)) {
      // Format: op rt, rs, imm
      rt = parts[1]; rs = parts[2]; imm = parts[3];
    } else if (['lw', 'sw'].includes(opcode)) {
      // Format: op rt, offset(rs)
      rt = parts[1];
      const match = parts[2].match(/(-?\d+)\((\$\w+)\)/);
      if (match) { imm = match[1]; rs = match[2]; }
    } else if (['beq', 'bne'].includes(opcode)) {
      // Format: op rs, rt, label/offset
      rs = parts[1]; rt = parts[2]; imm = parts[3]; // treating label as immediate for simplicity
    } else {
      throw new Error("Unsupported instruction");
    }

    return { opcode, rs, rt, rd, imm, original: input };
  } catch (error) {
    return null; // Invalid format
  }
};

export const generateMachineCode = (parsed) => {
  if (!parsed) return null;
  const { opcode, rs, rt, rd, imm } = parsed;
  
  const rSBin = toBin(REG_MAP[rs] || 0, 5);
  const rTBin = toBin(REG_MAP[rt] || 0, 5);
  const rDBin = toBin(REG_MAP[rd] || 0, 5);
  const immBin = toBin(parseInt(imm) || 0, 16);

  switch (opcode) {
    case 'add': return `000000 ${rSBin} ${rTBin} ${rDBin} 00000 100000`;
    case 'sub': return `000000 ${rSBin} ${rTBin} ${rDBin} 00000 100010`;
    case 'addi': return `001000 ${rSBin} ${rTBin} ${immBin}`;
    case 'lw': return `100011 ${rSBin} ${rTBin} ${immBin}`;
    case 'sw': return `101011 ${rSBin} ${rTBin} ${immBin}`;
    case 'beq': return `000100 ${rSBin} ${rTBin} ${immBin}`;
    case 'bne': return `000101 ${rSBin} ${rTBin} ${immBin}`;
    default: return '';
  }
};

// Generates the ground truth for the Sidebar forms and Wire Selection
export const generateAnswerKey = (parsed) => {
  if (!parsed) return null;
  const { opcode } = parsed;

  // 1. Base Signal Definitions (Ground Truth)
  const signals = {
    'add':  { RegDst: '1', ALUSrc: '0', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '1', ALUOp0: '0' },
    'sub':  { RegDst: '1', ALUSrc: '0', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '1', ALUOp0: '0' },
    'addi': { RegDst: '0', ALUSrc: '1', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '0', ALUOp0: '0' },
    'lw':   { RegDst: '0', ALUSrc: '1', MemToReg: '1', RegWrite: '1', MemRead: '1', MemWrite: '0', Branch: '0', ALUOp1: '0', ALUOp0: '0' },
    'sw':   { RegDst: 'X', ALUSrc: '1', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '1', Branch: '0', ALUOp1: '0', ALUOp0: '0' },
    'beq':  { RegDst: 'X', ALUSrc: '0', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '0', Branch: '1', ALUOp1: '0', ALUOp0: '1' },
    'bne':  { RegDst: 'X', ALUSrc: '0', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '0', Branch: '1', ALUOp1: '0', ALUOp0: '1' } // Assuming bne has similar basic path logic for this scope
  };

  // 2. Map required wires dynamically (using your existing master wire logic)
  const targetWires = []; // You will map your INSTRUCTION_SEQUENCES logic here based on opcode

  return {
    machineCode: generateMachineCode(parsed).replace(/\s/g, ''), // Strip spaces for easy validation
    signals: signals[opcode],
    targetWires: targetWires,
    // Note: Generating dynamic exact numerical dataValues (like 17 + 18 = 35) requires 
    // simulating a virtual memory/register state, which you might want to mock 
    // or set randomly based on the instruction for practice mode.
  };
};