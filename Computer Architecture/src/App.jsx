import DiagramCanvas from './components/DiagramCanvas';
import Sidebar from './components/Sidebar';
import InstructionPanel from './components/InstructionPanel';
import { useDiagramStore } from './store/diagramStore';

function App() {
  const { theme } = useDiagramStore();

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-800'
    }`}>
      <InstructionPanel />
      <DiagramCanvas />
      <Sidebar />
    </div>
  );
}

export default App;