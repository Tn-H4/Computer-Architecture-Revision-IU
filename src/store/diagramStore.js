import { create } from 'zustand';
import { parseInstruction, generateAnswerKey, getMachineCodeTemplate } from '../utils/instructionEngine';
import { INSTRUCTION_ANSWERS } from '../utils/instructionAnswers.js';
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

const INSTRUCTION_SEQUENCES = {
  'add': {
    1: ['wire_2', 'wire_6', 'wire_8', 'wire_7', 'wire_3', 'wire_11', 'wire_5', 'wire_12', 'wire_23'],
    2: ['wire_4', 'wire_14', 'wire_15', 'wire_1'],
    3: ['wire_30', 'wire_36', 'wire_19', 'wire_21', 'wire_22', 'wire_35'],
    4: ['wire_35', 'wire_33'] 
  },
  'sub': {
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
    1: ['wire_2', 'wire_6', 'wire_7', 'wire_8', 'wire_10', 'wire_3'],
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

  isExpanded: false,
  toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (val) => set({ isExpanded: val }),

  // Add this near your other state variables
  isBugModalOpen: false,
  setBugModalOpen: (isOpen) => set({ isBugModalOpen: isOpen }),

  // Add these to your existing Zustand store definition
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  
  // Change your currentChapter default from 1 to 0
  currentChapter: 0, 
  setChapter: (chapter) => set({ currentChapter: chapter, isMenuOpen: false }),
  
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  currentCycle: 0,
  isAnimating: false,
  animationId: 0, 
  activeWires: [],         
  activeControlWires: [],  
  
  interactionMode: 'explore', 
  userSelectedWires: [],      
  activeInstruction: null, 
  practiceInput: '',
  practiceMachineCode: '',
  showAnswerKey: false,
  setShowAnswerKey: (val) => set({ showAnswerKey: val }),
  setPracticeInput: (input) => {
    set((state) => {
      const newParsed = parseInstruction(input);
      const oldParsed = parseInstruction(state.practiceInput);
      
      let newMachineCode = state.practiceMachineCode;

      // If the instruction becomes valid, or changes type, reset the X template
      if (newParsed && (!oldParsed || oldParsed.opcode !== newParsed.opcode)) {
        newMachineCode = getMachineCodeTemplate(newParsed.opcode);
      } else if (!input.trim()) {
        newMachineCode = ''; // Clear if input is empty
      }

      return { 
        practiceInput: input, 
        practiceMachineCode: newMachineCode,
        verificationState: null // Clear feedback when typing
      };
    });
  },
  setPracticeMachineCode: (code) => set({ practiceMachineCode: code }),

  

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

  setActiveInstruction: (inst, incomingArrays = []) => {
    const currentState = get();
    
    let fullAnswers = INSTRUCTION_ANSWERS[inst] || emptyAnswers;
    
    // Fallback logic: If the panel didn't send arrays, use Master Dictionary
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
        verificationState: null,
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

verifyPracticeSubmission: () => {
    try {
      const currentState = get();
      
      // Safety Check 1: Did the engine import correctly?
      if (typeof parseInstruction !== 'function') {
        alert("System Error: parseInstruction is missing. Check your imports at the top of diagramStore.js");
        return false;
      }

      // Safety Check 2: Protect against undefined inputs
      const parsed = parseInstruction(currentState.practiceInput || '');
      if (!parsed) {
        alert("Invalid instruction format. Please type a valid instruction first.");
        return false;
      }

      const opcode = parsed.opcode;
      const groundTruth = generateAnswerKey(parsed) || {}; // Fallback to empty object to prevent crashes

      // 1. Verify Machine Code (Safely stringify and strip spaces)
      const cleanUserMC = String(currentState.practiceMachineCode || '').replace(/\s/g, '').toUpperCase();
      const cleanCorrectMC = String(groundTruth.machineCode || '').replace(/\s/g, '').toUpperCase();
      const isMachineCodeCorrect = cleanUserMC === cleanCorrectMC && !cleanUserMC.includes('X');

      // 2. Verify Diagram Wires safely
      const sequences = INSTRUCTION_SEQUENCES[opcode] || {};
      let correctWires = [];
      Object.values(sequences).forEach(cycleWires => {
        if (Array.isArray(cycleWires)) correctWires.push(...cycleWires);
      });
      
      const uniqueCorrectWires = [...new Set(correctWires)].sort();
      const uniqueUserWires = [...new Set(currentState.userSelectedWires || [])].sort();
      const isWiresCorrect = JSON.stringify(uniqueUserWires) === JSON.stringify(uniqueCorrectWires);

      // 3. Verify Form Signals, Data Values, and Units (Sidebar)
      let isFormCorrect = true;
      const correctSignalsForm = {};
      const correctDataForm = {};
      const correctUnitsForm = {};
      
      const userAnswers = currentState.answers || {};

      // Grade Signals (Treat blank as 'X')
      if (groundTruth.signals) {
          Object.keys(groundTruth.signals).forEach(k => {
             let userVal = String(userAnswers.signals?.[k] || '').trim().toUpperCase();
             if (userVal === '') userVal = 'X'; // Forgive blanks
             
             const isSignalRight = userVal === String(groundTruth.signals[k]).trim().toUpperCase();
             correctSignalsForm[k] = isSignalRight;
             if (!isSignalRight) isFormCorrect = false;
          });
      }

      // Grade Data Values (Treat blank as 'X')
      if (groundTruth.dataValues) {
          Object.keys(groundTruth.dataValues).forEach(k => {
             let userVal = String(userAnswers.dataValues?.[k] || '').trim().toUpperCase();
             if (userVal === '') userVal = 'X'; // Forgive blanks

             const isDataRight = userVal === String(groundTruth.dataValues[k]).toUpperCase();
             correctDataForm[k] = isDataRight;
             if (!isDataRight) isFormCorrect = false;
          });
      }

      // Grade Functional Units (Safely handle booleans)
      if (groundTruth.functionalUnits) {
          Object.keys(groundTruth.functionalUnits).forEach(k => {
             const isUnitRight = !!userAnswers.functionalUnits?.[k] === !!groundTruth.functionalUnits[k];
             correctUnitsForm[k] = isUnitRight;
             if (!isUnitRight) isFormCorrect = false;
          });
      }

      const isFullyCorrect = isMachineCodeCorrect && isWiresCorrect && isFormCorrect;

      // Update the state safely
      set({
         verificationState: {
             machineCode: isMachineCodeCorrect,
             correctMachineCode: groundTruth.machineCode || '',
             signals: correctSignalsForm,
             dataValues: correctDataForm,
             functionalUnits: correctUnitsForm,
             correctDataValues: groundTruth.dataValues,
             correctSignals: groundTruth.signals, 
             formCorrect: isFormCorrect,
             wiresCorrect: isWiresCorrect,
             correctWires: uniqueCorrectWires 
         }
      });

      return isFullyCorrect;} catch (error) {
      console.error("Verification crashed:", error);
      alert("Verification failed. Please check the browser console (F12) for the exact error.");
      return false;
    }
  },

  
}));
