export const cpuComponents = {
  pc: { 
    title: 'Program Counter (PC)', 
    description: 'A register that holds the memory address of the next instruction to be fetched and executed.' 
  },
  instruction_memory: { 
    title: 'Instruction Memory', 
    description: 'A memory unit that stores the instructions of a program. It outputs the instruction located at the address provided by the PC.' 
  },
  alu: { 
    title: 'ALU (Arithmetic Logic Unit)', 
    description: 'Performs all mathematical and logical operations (e.g., ADD, SUB, AND, OR) required by the instruction.' 
  },
  registers: { 
    title: 'Register File', 
    description: 'Fast, on-chip memory locations. It can read two registers and write to one register simultaneously based on the instruction fields.' 
  },
  control_unit: { 
    title: 'Control Unit', 
    description: 'Decodes the opcode of the instruction and coordinates the other components by generating appropriate control signals (like RegWrite, ALUSrc).' 
  }

  
};