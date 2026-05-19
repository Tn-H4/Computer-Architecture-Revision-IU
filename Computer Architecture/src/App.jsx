import DiagramCanvas from './components/DiagramCanvas';
import Sidebar from './components/Sidebar';
import InstructionPanel from './components/InstructionPanel';

function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      
      {/* 1. Left Column: Instruction Simulation */}
      <InstructionPanel />
      
      {/* 2. Middle Column: The SVG Diagram */}
      <DiagramCanvas />
    
      
    </div>
  );
}

export default App;