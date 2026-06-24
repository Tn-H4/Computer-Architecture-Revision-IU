export const INSTRUCTION_ANSWERS = {
  'add': {
    functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: false, SignExtend: false },
    dataValues: { reg_read1: '17', reg_read2: '18', reg_writeReg: '8', reg_writeData: '35', alu_oprd1: '17', alu_oprd2: '18', alu_result: '35', alu_zero: '0', mem_address: '35', mem_writeData: '18', mem_readData: 'N/A' },
    signals: { RegDst: '1', ALUSrc: '0', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '1', ALUOp0: '0' }
  },
  'addi': {
    functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: false, SignExtend: true },
    dataValues: { reg_read1: '25', reg_read2: 'N/A', reg_writeReg: '16', reg_writeData: '125', alu_oprd1: '25', alu_oprd2: '100', alu_result: '125', alu_zero: '0', mem_address: '125', mem_writeData: 'N/A', mem_readData: 'N/A' },
    signals: { RegDst: '0', ALUSrc: '1', MemToReg: '0', RegWrite: '1', MemRead: '0', MemWrite: '0', Branch: '0', ALUOp1: '0', ALUOp0: '0' }
  },
  'lw': {
    functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: true, SignExtend: true },
    dataValues: { reg_read1: '100', reg_read2: 'N/A', reg_writeReg: '8', reg_writeData: '500', alu_oprd1: '100', alu_oprd2: '4', alu_result: '104', alu_zero: '0', mem_address: '104', mem_writeData: 'N/A', mem_readData: '500' },
    signals: { RegDst: '0', ALUSrc: '1', MemToReg: '1', RegWrite: '1', MemRead: '1', MemWrite: '0', Branch: '0', ALUOp1: '0', ALUOp0: '0' }
  },
  'sw': {
    functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: true, SignExtend: true },
    dataValues: { reg_read1: '200', reg_read2: '500', reg_writeReg: 'X', reg_writeData: 'X', alu_oprd1: '200', alu_oprd2: '4', alu_result: '204', alu_zero: '0', mem_address: '204', mem_writeData: '500', mem_readData: 'N/A' },
    signals: { RegDst: 'X', ALUSrc: '1', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '1', Branch: '0', ALUOp1: '0', ALUOp0: '0' }
  },
  'beq': {
    functionalUnits: { PC: true, InstructionMemory: true, Registers: true, ALU: true, DataMemory: false, SignExtend: true },
    dataValues: { reg_read1: '42', reg_read2: '42', reg_writeReg: 'X', reg_writeData: 'X', alu_oprd1: '42', alu_oprd2: '42', alu_result: '0', alu_zero: '1', mem_address: 'X', mem_writeData: 'X', mem_readData: 'X' },
    signals: { RegDst: 'X', ALUSrc: '0', MemToReg: 'X', RegWrite: '0', MemRead: '0', MemWrite: '0', Branch: '1', ALUOp1: '0', ALUOp0: '1' }
  }
};

