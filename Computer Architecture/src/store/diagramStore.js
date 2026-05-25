import { create } from 'zustand';


// Master list of all Control Signal Wires (Turns Red)
const CONTROL_WIRES = [
  'wire_5', 'wire_23', 'wire_24', 'wire_25', 
  'wire_28', 'wire_29', 'wire_30', 'wire_31', 'wire_36'
];

// Empty form state
const emptyAnswers = {
  functionalUnits: { PC: false, InstructionMemory: false, Registers: false, ALU: false, DataMemory: false, SignExtend: false },
  dataValues: { 
    reg_read1: '', reg_read2: '', reg_writeReg: '', reg_writeData: '',
    alu_oprd1: '', alu_oprd2: '', alu_result: '', alu_zero: '',
    mem_address: '', mem_writeData: '', mem_readData: ''
  },
  signals: { RegDst: '', ALUSrc: '', MemToReg: '', RegWrite: '', MemRead: '', MemWrite: '', Branch: '', ALUOp1: '', ALUOp0: '' }
};

const INSTRUCTION_ANSWERS = {
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

const INSTRUCTION_SEQUENCES = {
  'add': {
    1: ['wire_2', 'wire_6', 'wire_8', 'wire_7', 'wire_3', 'wire_11', 'wire_5', 'wire_12', 'wire_23'],
    2: ['wire_4', 'wire_14', 'wire_15', 'wire_1'],
    3: ['wire_30', 'wire_36', 'wire_19', 'wire_21', 'wire_22', 'wire_35'],
    4: ['wire_35', 'wire_33'] 
  },
  'addi': {
    1: ['wire_2', 'wire_6', 'wire_7', 'wire_8', 'wire_9', 'wire_10', 'wire_12', 'wire_23'],
    2: ['wire_4', 'wire_14', 'wire_15', 'wire_1'],
    3: ['wire_30', 'wire_31', 'wire_36', 'wire_20', 'wire_21', 'wire_22', 'wire_35'],
    4: ['wire_35', 'wire_33']
  },
  'lw': {
    1: ['wire_2', 'wire_6', 'wire_7', 'wire_8', 'wire_9', 'wire_10', 'wire_12', 'wire_23'],
    2: ['wire_4', 'wire_14', 'wire_15', 'wire_1'],
    3: ['wire_30', 'wire_31', 'wire_36', 'wire_20', 'wire_21', 'wire_22', 'wire_37'],
    4: ['wire_37', 'wire_38', 'wire_33', 'wire_24', 'wire_29']
  },
  'sw': {
    1: ['wire_2', 'wire_6', 'wire_7', 'wire_8', 'wire_10', 'wire_23', 'wire_3'],
    2: ['wire_4', 'wire_14', 'wire_15', 'wire_1'],
    3: ['wire_30', 'wire_31', 'wire_36', 'wire_20', 'wire_21', 'wire_22', 'wire_37'],
    4: ['wire_34', 'wire_37', 'wire_28']
  },
  'beq': {
    1: ['wire_2', 'wire_6', 'wire_7', 'wire_8', 'wire_10', 'wire_3'],
    2: ['wire_4', 'wire_14', 'wire_16'],
    3: ['wire_10', 'wire_13', 'wire_14', 'wire_16', 'wire_21', 'wire_19', 'wire_22', 'wire_30', 'wire_36',],
    4: ['wire_18', 'wire_17',  'wire_25', 'wire_26', 'wire_27',  'wire_1']
  }
};

export const useDiagramStore = create((set, get) => ({
  selectedComponent: null,
  hoveredComponent: null,

  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  currentCycle: 0,
  isAnimating: false,
  animationId: 0, 
  activeWires: [],         
  activeControlWires: [],  
  
  interactionMode: 'explore', 
  userSelectedWires: [],      
  activeInstruction: 'add', 

  answers: emptyAnswers,
  setAnswers: (newAnswers) => set({ answers: newAnswers, verificationState: null }),

  setHoveredComponent: (id) => set({ hoveredComponent: id }),
  setSelectedComponent: (id) => set({ selectedComponent: id }),
  
  cycleSequences: { 1: [], 2: [], 3: [], 4: [] },

  

  playCycle: async () => {
    const currentState = get();
    if (currentState.isAnimating || currentState.currentCycle >= 4) return;

    const nextCycle = currentState.currentCycle + 1;
    const currentAnimId = currentState.animationId + 1;

    set({ 
      currentCycle: nextCycle, 
      isAnimating: true,
      animationId: currentAnimId 
    });

    const wiresToAdd = currentState.cycleSequences[nextCycle] || [];

    for (const wire of wiresToAdd) {
      if (get().animationId !== currentAnimId) return; 

      await new Promise(resolve => setTimeout(resolve, 600)); 
      
      if (get().animationId !== currentAnimId) return;

      if (CONTROL_WIRES.includes(wire)) {
        set((prev) => ({ activeControlWires: [...new Set([...prev.activeControlWires, wire])] }));
      } else {
        set((prev) => ({ activeWires: [...new Set([...prev.activeWires, wire])] }));
      }
    }

    if (get().animationId === currentAnimId) {
      let updatedAnswers = get().answers;
      if (nextCycle === 4) {
        updatedAnswers = INSTRUCTION_ANSWERS[get().activeInstruction] || emptyAnswers;
      }
      set({ isAnimating: false, answers: updatedAnswers });
    }
  },

  skipToCycleEnd: () => {
    const currentState = get();
    if (!currentState.isAnimating) return;

    const newAnimId = currentState.animationId + 1; 
    const cycle = currentState.currentCycle;

    let newDataWires = [];
    let newControlWires = [];

    for (let i = 1; i <= cycle; i++) {
      const wiresToAdd = currentState.cycleSequences[i] || [];
      wiresToAdd.forEach(wire => {
        if (CONTROL_WIRES.includes(wire)) newControlWires.push(wire);
        else newDataWires.push(wire);
      });
    }

    let updatedAnswers = currentState.answers;
    if (cycle === 4) {
      updatedAnswers = INSTRUCTION_ANSWERS[currentState.activeInstruction] || emptyAnswers;
    }

    set({ 
      animationId: newAnimId,
      isAnimating: false,
      activeWires: [...new Set(newDataWires)],
      activeControlWires: [...new Set(newControlWires)],
      answers: updatedAnswers
    });
  },

  prevCycle: () => {
    const currentState = get();
    if (currentState.isAnimating || currentState.currentCycle <= 0) return;

    const prev = currentState.currentCycle - 1;
    let newDataWires = [];
    let newControlWires = [];

    for (let i = 1; i <= prev; i++) {
      const wiresToAdd = currentState.cycleSequences[i] || [];
      wiresToAdd.forEach(wire => {
        if (CONTROL_WIRES.includes(wire)) newControlWires.push(wire);
        else newDataWires.push(wire);
      });
    }

    set({ 
      currentCycle: prev, 
      activeWires: [...new Set(newDataWires)],
      activeControlWires: [...new Set(newControlWires)]
    });
  },

  clearWires: () => {
    const currentState = get();
    set({ 
      activeWires: [], activeControlWires: [], userSelectedWires: [],
      currentCycle: 0, isAnimating: false, animationId: currentState.animationId + 1, answers: emptyAnswers 
    });
  },

  setInteractionMode: (mode) => {
    const currentState = get();
    set({ 
      interactionMode: mode, userSelectedWires: [], activeWires: [], activeControlWires: [],
      currentCycle: 0, isAnimating: false, animationId: currentState.animationId + 1
    });
  },
  
  toggleUserWire: (id) => {
    const currentState = get();
    set({
      userSelectedWires: currentState.userSelectedWires.includes(id)
        ? currentState.userSelectedWires.filter(w => w !== id) 
        : [...currentState.userSelectedWires, id]              
    });
  },

  // 🛡️ INDESTRUCTIBLE FIX: Works beautifully no matter what you send it!
  setActiveInstruction: (inst, incomingArrays = []) => {
    const currentState = get();
    
    let fullAnswers = INSTRUCTION_ANSWERS[inst] || emptyAnswers;
    
    // Fallback logic: If the panel didn't send arrays, use our Master Dictionary!
    let sequences = { 1: [], 2: [], 3: [], 4: [] };
    if (incomingArrays && incomingArrays.length > 0) {
       incomingArrays.forEach((arr, i) => { sequences[i+1] = arr; });
    } else {
       sequences = INSTRUCTION_SEQUENCES[inst] || sequences;
    }
    
    let flatDataWires = [];
    let flatControlWires = [];

    // Automatically sort all the lines into blue (data) or red (control)
    Object.values(sequences).forEach(cycleWires => {
        if (Array.isArray(cycleWires)) {
            cycleWires.forEach(wire => {
              if (CONTROL_WIRES.includes(wire)) flatControlWires.push(wire);
              else flatDataWires.push(wire);
            });
        }
    });

    set({ 
        activeInstruction: inst, 
        cycleSequences: sequences,
        activeWires: [...new Set(flatDataWires)], 
        activeControlWires: [...new Set(flatControlWires)], 
        userSelectedWires: [],
        currentCycle: 4, 
        isAnimating: false, 
        animationId: currentState.animationId + 1, 
        answers: fullAnswers,
        verificationState: null, // <-- ADD THIS: Clears form feedback on instruction change
        showAnswerKey: false
    });
  },

  verificationState: null, // Stores which fields are correct/incorrect
  
  verifyAnswers: () => {
    const { answers, activeInstruction } = get();
    const correctAnswers = INSTRUCTION_ANSWERS[activeInstruction];
    
    if (!correctAnswers) return;

    const result = {
      functionalUnits: {},
      dataValues: {},
      signals: {}
    };

    // Compare Functional Units
    Object.keys(correctAnswers.functionalUnits).forEach(k => {
      result.functionalUnits[k] = answers.functionalUnits[k] === correctAnswers.functionalUnits[k];
    });

    // Compare Data Values
    Object.keys(correctAnswers.dataValues).forEach(k => {
      result.dataValues[k] = answers.dataValues[k].toString().trim() === correctAnswers.dataValues[k].toString().trim();
    });

    // Compare Signals
    Object.keys(correctAnswers.signals).forEach(k => {
      result.signals[k] = answers.signals[k].toString().trim() === correctAnswers.signals[k].toString().trim();
    });

    set({ verificationState: result });
  },
  
  resetVerification: () => set({ verificationState: null }),
}));