import { useDiagramStore } from '../store/diagramStore';
import { useState } from 'react';

export default function Sidebar() {
  const { activeInstruction, clearWires } = useDiagramStore();
  const [formData, setFormData] = useState({ q1: '', q2: '', q3: '' });

  if (!activeInstruction) {
    return <div className="w-80 p-6 text-slate-400">Select an instruction to begin.</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would check formData against your "answer key"
    alert("Answers submitted for: " + activeInstruction);
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Analysis: {activeInstruction.toUpperCase()}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">1. Functional Units</label>
          <textarea 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
            rows="3"
            placeholder="e.g. PC, Instruction Memory, ALU..."
            onChange={(e) => setFormData({...formData, q1: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">2. Input/Output Values</label>
          <textarea 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
            rows="3"
            onChange={(e) => setFormData({...formData, q2: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">3. Control Signals</label>
          <textarea 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
            rows="3"
            onChange={(e) => setFormData({...formData, q3: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full bg-sky-600 py-2 rounded font-bold hover:bg-sky-500">
          Check Answers
        </button>
      </form>
    </div>
  );
}