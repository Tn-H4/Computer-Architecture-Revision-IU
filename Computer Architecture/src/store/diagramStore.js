import { create } from 'zustand';

export const useDiagramStore = create((set) => ({
  selectedComponent: null,
  hoveredComponent: null,
  
  // --- Simulation Mode States ---
  activeWires: [],         // Data paths (Turns Blue)
  activeControlWires: [],  // Control signals (Turns Red)
  
  // --- Practice Mode States ---
  interactionMode: 'explore', // 'explore' or 'practice_click'
  userSelectedWires: [],      // Wires the user clicks to test themselves

  // Standard Hover/Select
  setHoveredComponent: (id) => set({ hoveredComponent: id }),
  setSelectedComponent: (id) => set({ selectedComponent: id }),
  
  // Turn on simulation lights (Accepts Data array and Control array)
  setActiveWires: (dataWires, controlWires = []) => set({ 
    activeWires: dataWires, 
    activeControlWires: controlWires,
    userSelectedWires: [] // clear practice wires when showing a simulation
  }), 
  
  // Turn everything off
  clearWires: () => set({ activeWires: [], activeControlWires: [], userSelectedWires: [] }), 

  // Mode Toggles
  setInteractionMode: (mode) => set({ 
    interactionMode: mode, 
    userSelectedWires: [], 
    activeWires: [], 
    activeControlWires: [] 
  }),
  
  // Toggle user wire selection for Practice Mode
  toggleUserWire: (id) => set((state) => ({
    userSelectedWires: state.userSelectedWires.includes(id)
      ? state.userSelectedWires.filter(w => w !== id) // Remove if already clicked
      : [...state.userSelectedWires, id]              // Add if newly clicked
  })),

  // Add these to your Zustand store
  set({
  activeInstruction: null, // e.g., 'addi', 'lw', 'sw'
  setActiveInstruction: (inst) => set({ activeInstruction: inst }),
  });
}));