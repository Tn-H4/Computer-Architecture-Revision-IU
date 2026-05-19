import { useDiagramStore } from '../store/diagramStore';

// Import your new separate files!
import Registers from './cpu-parts/Register';
import ControlUnit from './cpu-parts/ControlUnit';
import Alu from './cpu-parts/ALU';
import AluControl from './cpu-parts/ALUControl';

export default function DiagramCanvas() {
  const { setHoveredComponent, setSelectedComponent, selectedComponent, hoveredComponent } = useDiagramStore();

  const getGroupProps = (id) => {
    const isActive = selectedComponent === id;
    const isAnotherHovered = hoveredComponent && hoveredComponent !== id; 

    return {
      id,
      className: `cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.8)] opacity-100' 
          : 'hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
      } ${
        isAnotherHovered ? 'opacity-30' : 'opacity-100'
      }`,
      onMouseEnter: () => setHoveredComponent(id),
      onMouseLeave: () => setHoveredComponent(null),
      onClick: () => setSelectedComponent(id)
    };
  };

  const getTextStyle = (id) => ({
    pointerEvents: 'none', 
    userSelect: 'none', 
    fill: '#0f172a',
    transition: 'opacity 0.3s',
    opacity: (hoveredComponent && hoveredComponent !== id) ? 0 : 1 
  });

  const textStyle = { pointerEvents: 'none', userSelect: 'none', fill: '#0f172a' };
  const textClass = "font-bold font-sans";

  // We bundle all the helpers together so it's easy to pass them down
  const sharedProps = {
    getGroupProps,
    getTextStyle,
    textClass,
    textStyle,
    hoveredComponent
  };

  return (
    <div className="flex-1 bg-slate-950 flex justify-center items-center overflow-auto p-8 relative">
      <svg width="1088" height="588" viewBox="0 0 1088 588" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto">
        
        {/* Look how clean this is now! */}
        <Registers {...sharedProps} />
        <ControlUnit {...sharedProps} />
        <Alu {...sharedProps} />
        <AluControl {...sharedProps} />

        {/* ... keep the rest of your raw SVG here until you move them to their own files ... */}

      </svg>
    </div>
  );
}