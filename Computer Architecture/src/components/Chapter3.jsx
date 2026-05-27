import React from 'react';
import { useDiagramStore } from '../store/diagramStore';

export default function Chapter3() {
  const theme = useDiagramStore(state => state.theme);

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full ${
      theme === 'dark' ? 'text-slate-400 bg-slate-950' : 'text-slate-500 bg-slate-50'
    }`}>
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Chapter 3</h1>
        <p className="text-xl">MIPS Assembly Basics</p>
        <p className="text-md mt-4 opacity-70">Workspace coming soon...</p>
      </div>
    </div>
  );
}