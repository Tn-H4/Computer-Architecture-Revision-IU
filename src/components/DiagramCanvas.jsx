import React, { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';

const BINARY_UI = {
  'add': [
    { label: 'op (6)', bits: '000000', color: 'sky' },
    { label: 'rs (5)', bits: '10001', color: 'emerald' },
    { label: 'rt (5)', bits: '10010', color: 'purple' },
    { label: 'rd (5)', bits: '01000', color: 'amber' },
    { label: 'shamt (5)', bits: '00000', color: 'slate' },
    { label: 'funct (6)', bits: '100000', color: 'rose' }
  ],
  'sub': [
    { label: 'op (6)', bits: '000000', color: 'sky' },
    { label: 'rs (5)', bits: '10001', color: 'emerald' },
    { label: 'rt (5)', bits: '10010', color: 'purple' },
    { label: 'rd (5)', bits: '01000', color: 'amber' },
    { label: 'shamt (5)', bits: '00000', color: 'slate' },
    { label: 'funct (6)', bits: '100000', color: 'rose' }
  ],
  'addi': [
    { label: 'opcode', bits: '001000', color: 'pink' },
    { label: 'rs', bits: '10000', color: 'emerald' },
    { label: 'rt', bits: '10001', color: 'blue' },
    { label: 'Immediate', bits: '0000000001100100', color: 'orange' }
  ],
  'sw': [
    { label: 'opcode', bits: '101011', color: 'pink' },
    { label: 'rs', bits: '11101', color: 'emerald' },
    { label: 'rt', bits: '11111', color: 'blue' },
    { label: 'Immediate', bits: '0000000000000100', color: 'orange' }
  ],
  'lw': [
    { label: 'opcode', bits: '100011', color: 'pink' },
    { label: 'rs', bits: '10001', color: 'emerald' },
    { label: 'rt', bits: '01000', color: 'blue' },
    { label: 'Immediate', bits: '0000000000000100', color: 'orange' }
  ],
  'beq': [
    { label: 'opcode', bits: '000100', color: 'pink' },
    { label: 'rs', bits: '10001', color: 'emerald' },
    { label: 'rt', bits: '10010', color: 'blue' },
    { label: 'Immediate', bits: '0000000000000011', color: 'orange' }
  ]
};

// MINI DATA POPUP COMPONENT
const MiniPopup = ({ label, value }) => {
  const { theme } = useDiagramStore();
  
  return (
    <div className={`border px-2 py-1 rounded shadow-lg backdrop-blur-sm text-[11px] font-mono pointer-events-none inline-block w-fit whitespace-nowrap transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900/95 border-blue-500 text-blue-400 shadow-blue-500/30' 
        : 'bg-white/95 border-blue-400 text-blue-700 shadow-blue-400/20'
    }`}>
      {label && <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{label}: </span>}
      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

// SHARED LOGIC HOOK
const useWireLogic = (id, type) => {
  const { 
    activeWires = [], 
    activeControlWires = [], 
    interactionMode, 
    userSelectedWires = [], 
    toggleUserWire,
    theme,
    showAnswerKey,          
    verificationState       
  } = useDiagramStore();

  const isDataActive = activeWires.includes(id);
  const isCtrlActive = activeControlWires.includes(id);
  const isUserSelected = userSelectedWires.includes(id);

  let isActive; 
  let activeColor = '#38bdf8'; 

  if (interactionMode === 'practice_click') {
    if (showAnswerKey && verificationState?.correctWires) {
      const isCorrectWire = verificationState.correctWires.includes(id);
      
      if (isCorrectWire) {
        isActive = true;
        activeColor = '#10b981'; // Emerald 
      } else if (isUserSelected && !isCorrectWire) {
        isActive = true;
        activeColor = '#ef4444'; // Rose
      } else {
        isActive = false;
      }
    } else {
      isActive = isUserSelected;
      activeColor = '#a855f7'; // Purple 
    }
  } else {
    isActive = isDataActive || isCtrlActive;
    if (isCtrlActive) activeColor = '#ef4444'; 
  }

  const hasAnyActive = interactionMode === 'practice_click' 
    ? (showAnswerKey ? true : userSelectedWires.length > 0) 
    : (activeWires.length > 0 || activeControlWires.length > 0);
  
  const inactiveColor = theme === 'dark' ? '#475569' : '#cbd5e1'; 
  const currentOpacity = isActive ? 1 : (hasAnyActive ? 0.5 : 1); 

  const style = type === 'stroke' 
    ? { stroke: isActive ? activeColor : inactiveColor, opacity: currentOpacity }
    : { fill: isActive ? activeColor : inactiveColor, opacity: currentOpacity };

  const className = type === 'stroke'
    ? `transition-all duration-300 fill-none ${isActive ? 'stroke-[4px] svg-highlight' : 'stroke-[2px]'}`
    : `transition-all duration-300 ${isActive ? 'svg-highlight' : ''}`;

  const handleClick = (e) => {
    e.stopPropagation(); 
    if (interactionMode === 'practice_click' && !showAnswerKey) {
      toggleUserWire(id);
    } else if (interactionMode !== 'practice_click') {
      console.log(`Clicked wire: '${id}'`);
      navigator.clipboard.writeText(`'id'`);
    }
  };

  return { style, className: `${className} svg-clickable`, handleClick };
};

// FAT HITBOX COMPONENTS
const WirePath = ({ id, type = 'fill', d }) => {
  const { style, className, handleClick } = useWireLogic(id, type);
  const hitboxFill = type === 'stroke' ? 'none' : 'transparent';
  const hitboxStrokeWidth = type === 'stroke' ? '18' : '6';
  return (
    <g onClick={handleClick} onMouseDown={(e) => e.stopPropagation()} className="cursor-pointer group">
      <path d={d} stroke="transparent" fill={hitboxFill} strokeWidth={hitboxStrokeWidth} />
      <path d={d} className={`${className} transition-opacity duration-200 group-hover:opacity-100`} style={{...style, pointerEvents: 'none'}} />    </g>
  );
};

const WireLine = ({ id, x1, y1, x2, y2 }) => {
  const { style, className, handleClick } = useWireLogic(id, 'stroke');
  return (
    <g onClick={handleClick} onMouseDown={(e) => e.stopPropagation()} className="cursor-pointer group">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="18" fill="none" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} className={`${className} transition-opacity duration-200 group-hover:opacity-100`} style={{...style, pointerEvents: 'none'}} />    </g>
  );
};

// MAIN DIAGRAM CANVAS
export default function DiagramCanvas({ onToggleLeft, onToggleRight, onToggleExpand, isExpanded }) { // Updated props
  const { 
    setHoveredComponent, setSelectedComponent, selectedComponent, hoveredComponent,
    activeWires = [], activeControlWires = [], interactionMode, activeInstruction,
    theme, currentCycle, practiceInput, practiceMachineCode, setPracticeMachineCode, verificationState
  } = useDiagramStore();

  const isSimulating = activeWires.length > 0 || activeControlWires.length > 0;
  const isPractice = interactionMode === 'practice_click';
  const forceDetails = isSimulating || isPractice;

  // PAN & ZOOM LOGIC 
  const [scale, setScale] = useState(0.75); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStartDist, setPinchStartDist] = useState(null);

  // --- MOUSE EVENTS ---
  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('.svg-clickable')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    const zoomSensitivity = 0.0015;
    const delta = -e.deltaY * zoomSensitivity;
    setScale(prev => Math.min(Math.max(0.4, prev + delta), 3)); 
  };

  // --- TOUCH EVENTS ---
  const getPinchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy); 
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.svg-clickable')) return;
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false); 
      setPinchStartDist(getPinchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    } else if (e.touches.length === 2 && pinchStartDist) {
      const currentDist = getPinchDistance(e.touches);
      const zoomSensitivity = 0.005; 
      const delta = (currentDist - pinchStartDist) * zoomSensitivity;
      
      setScale(prev => Math.min(Math.max(0.4, prev + delta), 3));
      setPinchStartDist(currentDist); 
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setPinchStartDist(null);
  };

  const getGroupProps = (id) => {
    const isActive = selectedComponent === id;
    return {
      id,
      className: `cursor-pointer transition-all duration-300 opacity-100 ${
        isActive 
          ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]' 
          : (forceDetails ? '' : 'hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]')
      }`,
      onMouseEnter: () => !forceDetails && setHoveredComponent(id),
      onMouseLeave: () => !forceDetails && setHoveredComponent(null),
      onClick: (e) => {
        e.stopPropagation(); 
        setSelectedComponent(id);
      },
      onMouseDown: (e) => e.stopPropagation() 
    };
  };

  const textStyle = { pointerEvents: 'none', userSelect: 'none', fill: theme === 'dark' ? '#0f172a' : '#0f172a' };
  const textClass = "font-bold font-sans";

  const getBlockColor = (color) => {
    const maps = {
      dark: { sky: 'bg-sky-900/50 text-sky-300 border-sky-700/50', emerald: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50', purple: 'bg-purple-900/50 text-purple-300 border-purple-700/50', amber: 'bg-amber-900/50 text-amber-300 border-amber-700/50', slate: 'bg-slate-800/50 text-slate-300 border-slate-600/50', rose: 'bg-rose-900/50 text-rose-300 border-rose-700/50', pink: 'bg-pink-900/50 text-pink-300 border-pink-700/50', blue: 'bg-blue-900/50 text-blue-300 border-blue-700/50', orange: 'bg-orange-900/50 text-orange-300 border-orange-700/50' },
      light: { sky: 'bg-sky-100 text-sky-700 border-sky-300', emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300', purple: 'bg-purple-100 text-purple-700 border-purple-300', amber: 'bg-amber-100 text-amber-700 border-amber-300', slate: 'bg-slate-200 text-slate-700 border-slate-400', rose: 'bg-rose-100 text-rose-700 border-rose-300', pink: 'bg-pink-100 text-pink-700 border-pink-300', blue: 'bg-blue-100 text-blue-700 border-blue-300', orange: 'bg-orange-100 text-orange-700 border-orange-300' }
    };
    return maps[theme][color];
  };

  let displayOpcode = activeInstruction;
  if (isPractice) {
     const parts = (practiceInput || '').trim().split(' ');
     displayOpcode = parts.length > 0 && BINARY_UI[parts[0].toLowerCase()] ? parts[0].toLowerCase() : null;
  }
  
  const binaryBlocks = displayOpcode ? BINARY_UI[displayOpcode] : [];
  const machineCodeSegments = (practiceMachineCode || '').split(' ');

  const handleSegmentChange = (index, value) => {
      const cleanValue = value.replace(/[^01xX]/g, '');
      let newSegments = [...machineCodeSegments];
      while(newSegments.length < binaryBlocks.length) newSegments.push('');
      newSegments[index] = cleanValue;
      if (setPracticeMachineCode) setPracticeMachineCode(newSegments.join(' '));
  };

  return (
    <div className={`flex-1 flex flex-col justify-start items-center w-full h-full relative transition-colors duration-300 overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <div className={`w-full border-b p-3 flex flex-row justify-between items-center z-20 min-h-[6rem] relative transition-colors duration-300 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
        
        {/* LEFT BUTTON (Mobile/Tablet Only) */}
        <button 
          onClick={onToggleLeft}
          className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-md transition-colors border shadow-sm shrink-0 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
          title="Open Instructions"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* MACHINE CODE CONTAINER (old dimensions) */}
        <div className="flex-1 overflow-x-auto pb-2 flex justify-start lg:justify-center px-2">
          {binaryBlocks.length > 0 ? (
            <div className="flex gap-2 min-w-max mx-auto text-center font-mono relative">
              {binaryBlocks.map((block, i) => {
                const segmentValue = machineCodeSegments[i] || '';
                const displayValue = /^[xX]+$/.test(segmentValue) ? '' : segmentValue;
                
                return (
                  <div key={i} className="flex flex-col relative">
                    {isPractice ? (
                       <input 
                         type="text"
                         maxLength={block.bits.length}
                         placeholder={'0'.repeat(block.bits.length)}
                         value={displayValue} 
                         onChange={(e) => handleSegmentChange(i, e.target.value)}
                         className={`px-1 py-2 rounded-t border text-lg tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${getBlockColor(block.color)} ${verificationState?.machineCode === false ? 'border-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]' : ''}`}
                         style={{ width: `${Math.max(block.bits.length * 1.1 + 1, 3.5)}rem` }}
                       />
                    ) : (
                       <span className={`px-3 py-2 rounded-t border text-lg tracking-widest ${getBlockColor(block.color)}`}>
                         {block.bits}
                       </span>
                    )}
                    <span className={`text-xs py-1 rounded-b ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500 border border-t-0 border-slate-200'}`}>
                      {block.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex w-full items-center justify-center">
              <span className={`italic text-sm ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                {isPractice ? 'Enter a valid instruction on the left to build the machine code.' : 'Select an instruction to view binary breakdown.'}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* EXPAND/RESTORE BUTTON (Desktop Only) */}
          <button 
            onClick={onToggleExpand}
            className={`hidden lg:flex items-center justify-center px-3 py-2 font-semibold text-sm rounded-md transition-colors border shadow-sm ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
            title={isExpanded ? "Restore Sidebars" : "Expand Diagram"}
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h4V4m0 16v-4H4m16-4h-4v4m0-16v4h4" />
                </svg>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </>
            )}
          </button>

          {/* RIGHT BUTTON (Mobile/Tablet Only) */}
          <button 
            onClick={onToggleRight}
            className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-md transition-colors border shadow-sm ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
            title="Open Data Panel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>

        {isPractice && verificationState?.machineCode === false && (
         <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-1.5 rounded-full border shadow-lg z-30 flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-top-2 ${
           theme === 'dark' 
             ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-[0_4px_20px_rgba(225,29,72,0.3)] backdrop-blur-md' 
             : 'bg-white border-rose-300 text-rose-700 shadow-[0_4px_20px_rgba(225,29,72,0.15)]'
         }`}>
           <div className={`flex h-5 w-5 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Expected:</span>
             <span className="font-mono text-[13px] tracking-widest font-bold">
               {(() => {
                 let raw = verificationState.correctMachineCode || '';
                 if (!raw.includes(' ') && binaryBlocks.length > 0) {
                   let formatted = [];
                   let curr = 0;
                   binaryBlocks.forEach(b => {
                     formatted.push(raw.substring(curr, curr + b.bits.length));
                     curr += b.bits.length;
                   });
                   return formatted.join(' ');
                 }
                 return raw;
               })()}
             </span>
           </div>
         </div>
        )}
      </div>

      {/* PAN AND ZOOM WRAPPER */}
      <div 
        className="flex-1 w-full h-full relative overflow-hidden flex justify-center items-center touch-none cursor-default"        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        <div 
          className="will-change-transform flex justify-center items-center"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, 
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <svg width="1100" height="631" viewBox="0 0 1100 631" fill="none" xmlns="http://www.w3.org/2000/svg">
            
            <g id="datapath_wires">
              <WirePath id="wire_1" type="fill" d="M37 383.768L27 377.995L27 389.542L37 383.768ZM14.0184 383.768L13.0184 383.768L13.0184 384.768L14.0184 384.768L14.0184 383.768ZM14.0184 1.00003L14.0184 2.55782e-05L13.0184 2.14608e-05L13.0184 1.00003L14.0184 1.00003ZM893.5 1.00003L894.5 1.00003L894.5 2.63759e-05L893.5 2.27786e-05L893.5 1.00003ZM893.5 72.9999L893.5 73.9999L894.5 73.9999L894.5 72.9999L893.5 72.9999ZM28 383.768L28 382.768L14.0183 382.768L14.0184 383.768L14.0184 384.768L28 384.768L28 383.768ZM14.0184 383.768L15.0184 383.768L15.0184 1.00004L14.0184 1.00003L13.0184 1.00003L13.0184 383.768L14.0184 383.768ZM14.0184 1.00003L14.0184 2.00004L893.5 2.00004L893.5 1.00003L893.5 2.27786e-05L14.0184 2.55782e-05L14.0184 1.00003ZM893.5 1.00003L892.5 1.00003L892.5 72.9999L893.5 72.9999L894.5 72.9999L894.5 1.00003L893.5 1.00003ZM893.5 72.9999L893.5 71.9999L875 71.9999L875 72.9999L875 73.9999L893.5 73.9999L893.5 72.9999Z" />
              <WirePath id="wire_2" type="fill" d="M132 374L122 368.226V379.773L132 374ZM79 374V375H123V374V373H79V374Z" />
              <WirePath id="wire_3" type="fill" d="M409 399L399 393.226L399 404.773L409 399ZM306 399L306 400L400 400L400 399L400 398L306 398L306 399Z" />
              <WirePath id="wire_4" type="fill" d="M99 87.4999L99 86.4999L98 86.4999L98 87.4999L99 87.4999ZM299.5 87.4999L289.5 81.7264L289.5 93.2734L299.5 87.4999ZM99 374L100 374L100 87.4999L99 87.4999L98 87.4999L98 374L99 374ZM99 87.4999L99 88.4999L290.5 88.4999L290.5 87.4999L290.5 86.4999L99 86.4999L99 87.4999Z" />
              <WirePath id="wire_5" type="stroke" d="M435.522 149.855L465.522 149.855L465.522 52.5L267 52.5L267 282.5L267 512.5L375.5 512.5L375.5 474.5" />
              <WireLine id="wire_6" x1="241" y1="398" x2="308" y2="398" />
              <WirePath id="wire_7" type="fill" d="M307 399L307 400L309 400L309 399L308 399L307 399ZM407.99 359.01L397.99 353.236L397.99 364.783L407.99 359.01ZM308 359.01L308 358.01L307 358.01L307 359.01L308 359.01ZM308 399L309 399L309 359.01L308 359.01L307 359.01L307 399L308 399ZM308 359.01L308 360.01L398.99 360.01L398.99 359.01L398.99 358.01L308 358.01L308 359.01Z" />
              <WirePath id="wire_8" type="fill" d="M360 225.119L350 219.345L350 230.892L360 225.119ZM308.486 225.118L308.486 224.118L307.486 224.118L307.486 225.118L308.486 225.118ZM351 225.119L351 224.119L308.486 224.118L308.486 225.118L308.486 226.118L351 226.119L351 225.119ZM308.486 225.118L307.486 225.118L307.486 401.118L308.486 401.118L309.486 401.118L309.486 225.118L308.486 225.118Z" />
              <WirePath id="wire_9" type="fill" d="M361.5 423.5L351.5 417.726L351.5 429.273L361.5 423.5ZM338 401.5L339 401.5L339 400.5L338 400.5L338 401.5ZM338 423.5L337 423.5L337 424.5L338 424.5L338 423.5ZM306.5 401.5L306.5 402.5L338 402.5L338 401.5L338 400.5L306.5 400.5L306.5 401.5ZM338 401.5L337 401.5L337 423.5L338 423.5L339 423.5L339 401.5L338 401.5ZM338 423.5L338 424.5L352.5 424.5L352.5 423.5L352.5 422.5L338 422.5L338 423.5Z" />
              <WirePath id="wire_10" type="stroke" d="M308.429 398.742L308.429 566.742L409.5 566.742" />
              <WirePath id="wire_11" type="fill" d="M360 453.5L350 447.726L350 459.273L360 453.5ZM308.5 398.5L308.5 397.5L306.5 397.5L306.5 398.5L307.5 398.5L308.5 398.5ZM307.5 453.5L306.5 453.5L306.5 454.5L307.5 454.5L307.5 453.5ZM351 453.5L351 452.5L307.5 452.5L307.5 453.5L307.5 454.5L351 454.5L351 453.5ZM307.5 453.5L308.5 453.5L308.5 398.5L307.5 398.5L306.5 398.5L306.5 453.5L307.5 453.5Z" />
              <WirePath id="wire_12" type="fill" d="M409 438L399 432.226V443.773L409 438ZM391 438V439H400V438V437H391V438Z" />
              <WirePath id="wire_13" type="fill" d="M487.532 572.823L486.532 572.823L486.532 574.823L487.532 574.823L487.532 573.823L487.532 572.823ZM658.532 121.823L648.532 116.049L648.532 127.596L658.532 121.823ZM620 573.823L620 574.823L621 574.823L621 573.823L620 573.823ZM620 121.823L620 120.823L619 120.823L619 121.823L620 121.823ZM487.532 573.823L487.532 574.823L620 574.823L620 573.823L620 572.823L487.532 572.823L487.532 573.823ZM620 573.823L621 573.823L621 121.823L620 121.823L619 121.823L619 573.823L620 573.823ZM620 121.823L620 122.823L649.532 122.823L649.532 121.823L649.532 120.823L620 120.823L620 121.823Z" />
              <WirePath id="wire_14" type="fill" d="M249.5 154.5H248.5V156.5H249.5V155.5V154.5ZM299.5 155.5L289.5 149.726V161.273L299.5 155.5ZM249.5 155.5V156.5H290.5V155.5V154.5H249.5V155.5Z" />
              <WirePath id="wire_15" type="fill" d="M842.5 54.9999L832.5 49.2264L832.5 60.7734L842.5 54.9999ZM575.5 118.504L575.5 119.504L576.5 119.504L576.5 118.504L575.5 118.504ZM575.5 19.4999L575.5 18.4999L574.5 18.4999L574.5 19.4999L575.5 19.4999ZM800.5 19.4999L801.5 19.4999L801.5 18.4999L800.5 18.4999L800.5 19.4999ZM800.5 54.9999L799.5 54.9999L799.5 55.9999L800.5 55.9999L800.5 54.9999ZM344.939 118.504L344.939 119.504L575.5 119.504L575.5 118.504L575.5 117.504L344.939 117.504L344.939 118.504ZM575.5 118.504L576.5 118.504L576.5 19.4999L575.5 19.4999L574.5 19.4999L574.5 118.504L575.5 118.504ZM575.5 19.4999L575.5 20.4999L800.5 20.4999L800.5 19.4999L800.5 18.4999L575.5 18.4999L575.5 19.4999ZM800.5 19.4999L799.5 19.4999L799.5 54.9999L800.5 54.9999L801.5 54.9999L801.5 19.4999L800.5 19.4999ZM800.5 54.9999L800.5 55.9999L833.5 55.9999L833.5 54.9999L833.5 53.9999L800.5 53.9999L800.5 54.9999Z" />
              <WirePath id="wire_16" type="fill" d="M734 50.4999L724 44.7264V56.2734L734 50.4999ZM575.5 115V116H576.5V115H575.5ZM575.5 50.4999V49.4999H574.5V50.4999H575.5ZM348 115V116L575.5 116V115V114L348 114V115ZM575.5 115H576.5V50.4999H575.5H574.5V115H575.5ZM575.5 50.4999V51.4999L725 51.4999V50.4999V49.4999L575.5 49.4999V50.4999Z" />
              <WirePath id="wire_17" type="fill" d="M841 84.4999L831 78.7264V90.2734L841 84.4999ZM782 84.4999V85.4999L832 85.4999V84.4999V83.4999L782 83.4999V84.4999Z" />
              <WirePath id="wire_18" type="fill" d="M734 121.5L724 115.726V127.273L734 121.5ZM706 121.5V122.5H725V121.5V120.5H706V121.5Z" />
              <WirePath id="wire_19" type="fill" d="M644 453.5L634 447.726V459.273L644 453.5ZM577 453.5V454.5H635V453.5V452.5H577V453.5Z" />
              <WirePath id="wire_20" type="fill" d="M643.5 486.5L633.5 480.726L633.5 492.273L643.5 486.5ZM621.5 574L621.5 575L622.5 575L622.5 574L621.5 574ZM621.5 486.5L621.5 485.5L620.5 485.5L620.5 486.5L621.5 486.5ZM492 574L492 575L621.5 575L621.5 574L621.5 573L492 573L492 574ZM621.5 574L622.5 574L622.5 486.5L621.5 486.5L620.5 486.5L620.5 574L621.5 574ZM621.5 486.5L621.5 487.5L634.5 487.5L634.5 486.5L634.5 485.5L621.5 485.5L621.5 486.5Z" />
              <WirePath id="wire_22" type="fill" d="M734.015 472.5L724.195 466.426L723.845 477.968L734.015 472.5ZM668.015 470.5L667.985 471.5L724.989 473.227L725.019 472.228L725.05 471.228L668.045 469.501L668.015 470.5Z" />
              <WirePath id="wire_23" type="stroke" d="M436.286 307.59L492 307.59L492 345" />
              <WirePath id="wire_24" type="stroke" d="M454.136 226.519L1075.14 226.519L1075.14 414.5" />
              <WirePath id="wire_25" type="stroke" d="M450.979 176.5L743 176.5L743 162.5L787.979 162.5" />
              <WirePath id="wire_26" type="stroke" d="M787.5 197.5L760 197.5L760 219.5L846.5 219.5L846.5 384.89L826.488 384.89" />
              <WirePath id="wire_27" type="stroke" d="M856.467 109.178L856.467 180.5L833 180.5" />
              <WirePath id="wire_30" type="stroke" d="M451.361 269.654L688 269.654L688 565.654L734.361 565.654" />
              <WirePath id="wire_31" type="stroke" d="M445 287.594L656.291 287.594L656.291 434.594" />
              <WirePath id="wire_32" type="stroke" d="M377.034 568.501L377.034 630L782.034 630L782.034 596.501" />
              <WirePath id="wire_33" type="fill" d="M1086.03 437.499L1085.03 437.499L1085.03 439.499L1086.03 439.499L1086.03 438.499L1086.03 437.499ZM408.031 480.499L398.031 474.725L398.031 486.272L408.031 480.499ZM1098.5 438.499L1099.5 438.499L1099.5 437.499L1098.5 437.499L1098.5 438.499ZM1098.5 621L1098.5 622L1099.5 622L1099.5 621L1098.5 621ZM388.5 480.499L388.5 479.499L387.5 479.499L387.5 480.499L388.5 480.499ZM388.5 621L387.5 621L387.5 622L388.5 622L388.5 621ZM1086.03 438.499L1086.03 439.499L1098.5 439.499L1098.5 438.499L1098.5 437.499L1086.03 437.499L1086.03 438.499ZM1098.5 438.499L1097.5 438.499L1097.5 621L1098.5 621L1099.5 621L1099.5 438.499L1098.5 438.499ZM388.5 480.499L388.5 481.499L399.031 481.499L399.031 480.499L399.031 479.499L388.5 479.499L388.5 480.499ZM1098.5 621L1098.5 620L388.5 620L388.5 621L388.5 622L1098.5 622L1098.5 621ZM388.5 621L389.5 621L389.5 480.499L388.5 480.499L387.5 480.499L387.5 621L388.5 621Z" />
              <WirePath id="wire_34" type="fill" d="M575.5 455.5L574.5 455.5L574.5 457.5L575.5 457.5L575.5 456.5L575.5 455.5ZM906.024 470.555L896.024 464.781L896.024 476.328L906.024 470.555ZM591.027 515L590.027 515L590.027 516L591.027 516L591.027 515ZM866 470.555L866 469.555L865 469.555L865 470.555L866 470.555ZM866 515L866 516L867 516L867 515L866 515ZM591.027 456.5L592.027 456.5L592.027 455.5L591.027 455.5L591.027 456.5ZM866 470.555L866 471.555L897.024 471.555L897.024 470.555L897.024 469.555L866 469.555L866 470.555ZM591.027 515L591.027 516L866 516L866 515L866 514L591.027 514L591.027 515ZM866 515L867 515L867 470.555L866 470.555L865 470.555L865 515L866 515ZM575.5 456.5L575.5 457.5L591.027 457.5L591.027 456.5L591.027 455.5L575.5 455.5L575.5 456.5ZM591.027 456.5L590.027 456.5L590.027 515L591.027 515L592.027 515L592.027 456.5L591.027 456.5Z" />
              <WirePath id="wire_35" type="fill" d="M826.5 433L825.5 433L825.5 435L826.5 435L826.5 434L826.5 433ZM1057.06 462.504L1047.06 456.73L1047.06 468.277L1057.06 462.504ZM1041 462.504L1041 461.504L1040 461.504L1040 462.504L1041 462.504ZM1041 565L1041 566L1042 566L1042 565L1041 565ZM841.064 565L840.064 565L840.064 566L841.064 566L841.064 565ZM841.064 434L842.064 434L842.064 433L841.064 433L841.064 434ZM1041 462.504L1041 463.504L1048.06 463.504L1048.06 462.504L1048.06 461.504L1041 461.504L1041 462.504ZM1041 565L1042 565L1042 462.504L1041 462.504L1040 462.504L1040 565L1041 565ZM841.064 565L841.064 566L1041 566L1041 565L1041 564L841.064 564L841.064 565ZM826.5 434L826.5 435L841.064 435L841.064 434L841.064 433L826.5 433L826.5 434ZM841.064 434L840.064 434L840.064 565L841.064 565L842.064 565L842.064 434L841.064 434Z" />
              <WireLine id="wire_36" x1="781" y1="532" x2="781" y2="480" />
              <WirePath id="wire_28" type="stroke" d="M454.148 238.522L968.148 238.522L968.148 397.522" />
              <WirePath id="wire_29" type="stroke" d="M454.227 250.554L879 250.555L879 553L965.227 553L965.228 511.554" />
              <WirePath id="wire_21" type="fill" d="M734 363L724 357.226V368.773L734 363ZM577 363V364H725V363V362H577V363Z" />
              <WirePath id="wire_37" type="fill" d="M910 434L900 428.226V439.773L910 434ZM826.5 434V435H901V434V433H826.5V434Z" />
              <WirePath id="wire_38" type="fill" d="M1056.99 425.5L1046.83 419.999L1047.15 431.542L1056.99 425.5ZM1019.99 426.5L1020.01 427.5L1048.02 426.743L1047.99 425.743L1047.96 424.744L1019.96 425.5L1019.99 426.5Z" />
            </g>

            {/* ---------------- CYCLE 1: Instruction Decode & Register Read ---------------- */}
            {currentCycle >= 1 && (
              <>
                {activeInstruction === 'add' && (
                  <>
                    <foreignObject x="580" y="325" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 1" value="17 ($s1)"/></foreignObject>
                    <foreignObject x="580" y="405" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 2" value="18 ($s2)"/></foreignObject>
                    <foreignObject x="290" y="480" width="150" height="50" className="overflow-visible z-50"><MiniPopup label="RegDst" value="1"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'addi' && (
                  <>
                    <foreignObject x="580" y="325" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 1" value="25 ($s1)"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'lw' && (
                  <>
                    <foreignObject x="580" y="325" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 1" value="100 ($s1)"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'sw' && (
                  <>
                    <foreignObject x="580" y="325" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 1" value="200 ($s2)"/></foreignObject>
                    <foreignObject x="580" y="405" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 2" value="500 ($s0)"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'beq' && (
                  <>
                    <foreignObject x="580" y="325" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 1" value="42 ($s1)"/></foreignObject>
                    <foreignObject x="580" y="405" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Read 2" value="42 ($s0)"/></foreignObject>
                  </>
                )}
              </>
            )}

            {/* ---------------- CYCLE 2: Execute / Address Calculation ---------------- */}
            {currentCycle >= 2 && (
              <>
                <foreignObject x="80" y="50" width="180" height="40" className="overflow-visible z-50"><MiniPopup label="Address" value="0x00001000"/></foreignObject>
                <foreignObject x="350" y="80" width="200" height="50" className="overflow-visible z-50"><MiniPopup label="Next PC" value="0x00001004"/></foreignObject>

                {activeInstruction === 'addi' && <foreignObject x="500" y="530" width="100" height="40" className="overflow-visible z-50"><MiniPopup label="Sign Ext" value="100"/></foreignObject>}
                {activeInstruction === 'lw' && <foreignObject x="500" y="530" width="100" height="40" className="overflow-visible z-50"><MiniPopup label="Sign Ext" value="4"/></foreignObject>}
                {activeInstruction === 'sw' && <foreignObject x="500" y="530" width="100" height="40" className="overflow-visible z-50"><MiniPopup label="Sign Ext" value="4"/></foreignObject>}
                {activeInstruction === 'beq' && (
                  <>
                    <foreignObject x="500" y="530" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Sign Ext" value="Offset"/></foreignObject>
                    <foreignObject x="720" y="-10" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Target Addr" value="0x00001010"/></foreignObject>
                  </>
                )}
              </>
            )}

            {/* ---------------- CYCLE 3: ALU Execution ---------------- */}
            {currentCycle >= 3 && (
              <>
                {activeInstruction === 'add' && (
                  <>
                    <foreignObject x="695" y="330" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="17"/></foreignObject>
                    <foreignObject x="695" y="440" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="18"/></foreignObject>
                    <foreignObject x="750" y="500" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="10"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'addi' && (
                  <>
                    <foreignObject x="695" y="330" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="25"/></foreignObject>
                    <foreignObject x="695" y="440" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="100"/></foreignObject>
                    <foreignObject x="750" y="500" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="00"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'lw' && (
                  <>
                    <foreignObject x="695" y="330" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="100"/></foreignObject>
                    <foreignObject x="695" y="440" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="4"/></foreignObject>
                    <foreignObject x="750" y="500" width="150" height="40" className="overflow-visible z-50"><MiniPopup  value="00"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'sw' && (
                  <>
                    <foreignObject x="695" y="330" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="200"/></foreignObject>
                    <foreignObject x="695" y="440" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="4"/></foreignObject>
                  </>
                )}
                {activeInstruction === 'beq' && (
                  <>
                    <foreignObject x="695" y="330" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="42"/></foreignObject>
                    <foreignObject x="695" y="440" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="42"/></foreignObject>
                    <foreignObject x="750" y="500" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="01"/></foreignObject>
                    <foreignObject x="830" y="360" width="150" height="40" className="overflow-visible z-50"><MiniPopup value="1"/></foreignObject>
                  </>
                )}
              </>
            )}

            {/* ---------------- CYCLE 4: Memory & Writeback ---------------- */}
            {currentCycle >= 4 && (
              <>
                {activeInstruction === 'add' && <foreignObject x="1010" y="580" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Result" value="35"/></foreignObject>}
                
                {activeInstruction === 'addi' && <foreignObject x="1010" y="580" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Result" value="125"/></foreignObject>}
                
                {activeInstruction === 'lw' && (
                  <>
                    <foreignObject x="830" y="400" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Addr" value="104"/></foreignObject>
                    <foreignObject x="970" y="350" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Read Data" value="500"/></foreignObject>
                    <foreignObject  x="950" y="580" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Write Data (Reg)" value="500"/></foreignObject>
                  </>
                )}
                
                {activeInstruction === 'sw' && (
                  <>
                    <foreignObject x="830" y="400" width="150" height="40" className="overflow-visible z-50"><MiniPopup label="Addr" value="204"/></foreignObject>
                  </>
                )}
                
                {activeInstruction === 'beq' && (
                  <foreignObject x="800" y="15" width="200" height="40" className="overflow-visible z-50"><MiniPopup label="PCSrc" value="1 (Taken)"/></foreignObject>
                )}
              </>
            )}

            {/* =========================================
                THE COMPONENTS
                ========================================= */}
            <g {...getGroupProps('registers')}>
              <rect x="410" y="342" width="168" height="169" fill="#D9D9D9"/>
              {hoveredComponent === 'registers' || forceDetails ? (
                <>
                  {hoveredComponent === 'registers' && (
                    <rect x="410" y="342" width="168" height="169" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
                  )}
                  <text x="415" y="366" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Read register 1</text>
                  <text x="415" y="400" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Read register 2</text>
                  <text x="415" y="441" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Write register</text>
                  <text x="415" y="480" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Write data</text>
                  <text x="573" y="376" textAnchor="end" fontSize="14" className={textClass} style={textStyle}>Read data 1</text>
                  <text x="573" y="456" textAnchor="end" fontSize="14" className={textClass} style={textStyle}>Read data 2</text>
                </>
              ) : (
                <text x="494" y="433" textAnchor="middle" fontSize="24" className={textClass} style={textStyle}>Registers</text>
              )}
            </g>

            <g {...getGroupProps('control_unit')}>
              <ellipse cx="409.5" cy="228.5" rx="49.5" ry="99.5" fill="#D9D9D9"/>
              <text x="409" y="224" textAnchor="middle" fontSize="20" className={textClass} style={textStyle}>Control</text>
              <text x="409" y="248" textAnchor="middle" fontSize="20" className={textClass} style={textStyle}>Unit</text>
            </g>

            <g {...getGroupProps('alu_control')}>
              <path d="M828.5 565.5C828.5 582.897 807.234 597 781 597C754.766 597 733.5 582.897 733.5 565.5C733.5 548.103 754.766 534 781 534C807.234 534 828.5 548.103 828.5 565.5Z" fill="#D9D9D9"/>
              <text x="781" y="561" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>ALU</text>
              <text x="781" y="581" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Control</text>
            </g>

            <g {...getGroupProps('shift_left')}>
              <ellipse cx="684" cy="123" rx="24" ry="51" fill="#D9D9D9"/>
              <text x="684" y="111" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>Shift</text>
              <text x="684" y="129" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>left</text>
              <text x="684" y="147" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>2</text>
            </g>

            <g {...getGroupProps('sign_extend')}>
              <ellipse cx="450" cy="572" rx="40" ry="47" fill="#D9D9D9"/>
              <text x="450" y="568" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Sign</text>
              <text x="450" y="588" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>extend</text>
            </g>

            <g {...getGroupProps('alu')}>
              <path d="M737.5 334L827.5 376.5V459.5L737.5 502.5V444.5L777.5 418L737.5 391V334Z" fill="#D9D9D9"/>
              {hoveredComponent === 'alu' || forceDetails ? (
                <>
                  {hoveredComponent === 'alu' && (
                    <path d="M737.5 334L827.5 376.5V459.5L737.5 502.5V444.5L777.5 418L737.5 391V334Z" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
                  )}
                  <text x="742" y="366" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>oprd 1</text>
                  <text x="742" y="476" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>oprd 2</text>
                  <text x="782" y="486" textAnchor="middle" fontSize="12" className={textClass} style={textStyle}>ALU control</text>
                  <text x="822" y="385" textAnchor="end" fontSize="12" className={textClass} style={textStyle}>zero</text>
                  <text x="822" y="436" textAnchor="end" fontSize="12" className={textClass} style={textStyle}>ALU result</text>
                </>
              ) : (
                <text x="770" y="425" textAnchor="middle" fontSize="24" className={textClass} style={textStyle}>ALU</text>
              )}
            </g>

            <g {...getGroupProps('and_gate')}>
              <path d="M788 155C788 155 834 155 834 182C834 204.5 788 208.5 788 208.5V155Z" fill="#D9D9D9"/>
            </g>

            <g {...getGroupProps('data_memory')}>
              <rect x="909" y="395" width="112" height="116" fill="#D9D9D9"/>
              {hoveredComponent === 'data_memory' || forceDetails ? (
                <>
                  {hoveredComponent === 'data_memory' && (
                    <rect x="909" y="395" width="112" height="116" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
                  )}
                  <text x="914" y="440" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Address</text>
                  <text x="914" y="476" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Write data</text>
                  <text x="1016" y="426" textAnchor="end" fontSize="14" className={textClass} style={textStyle}>Read data</text>
                </>
              ) : (
                <>
                  <text x="965" y="447" textAnchor="middle" fontSize="22" className={textClass} style={textStyle}>Data</text>
                  <text x="965" y="473" textAnchor="middle" fontSize="22" className={textClass} style={textStyle}>memory</text>
                </>
              )}
            </g>

            <g {...getGroupProps('instruction_memory')}>
              <rect x="133" y="342" width="112" height="116" fill="#D9D9D9"/>
              {hoveredComponent === 'instruction_memory' || forceDetails ? (
                <>
                  {hoveredComponent === 'instruction_memory' && (
                    <rect x="133" y="342" width="112" height="116" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
                  )}
                  <text x="138" y="366" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>Read</text>
                  <text x="138" y="381" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>address</text>
                  <text x="240" y="406" textAnchor="end" fontSize="14" className={textClass} style={textStyle}>Instruction</text>
                </>
              ) : (
                <>
                  <text x="189" y="394" textAnchor="middle" fontSize="18" className={textClass} style={textStyle}>Instruction</text>
                  <text x="189" y="420" textAnchor="middle" fontSize="18" className={textClass} style={textStyle}>memory</text>
                </>
              )}
            </g>

            <g {...getGroupProps('adder_pc')}>
              <path d="M302 65.9999L346 94.7536V150.908L302 180V140.76L321.556 122.831L302 104.564V65.9999Z" fill="#D9D9D9"/>
              <text x="320" y="129" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Add</text>
            </g>

            <g {...getGroupProps('adder_branch')}>
              <path d="M736 30.9999L780 59.7536V115.908L736 145V105.76L755.556 87.8307L736 69.5637V30.9999Z" fill="#D9D9D9"/>
              <text x="754" y="94" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Add</text>
            </g>

            <g {...getGroupProps('pc')}>
              <rect x="41" y="342" width="39" height="85" fill="#D9D9D9"/>
              <text x="60" y="391" textAnchor="middle" fontSize="20" className={textClass} style={textStyle}>PC</text>
            </g>

            <g {...getGroupProps('mux_pcsrc')}>
              <rect x="842" y="39.9999" width="30" height="70" rx="15" fill="#D9D9D9"/>
              <text x="857" y="79" textAnchor="middle" fontSize="14" transform="rotate(-90 857 79)" className={textClass} style={textStyle}>MUX</text>
            </g>

            <g {...getGroupProps('mux_alusrc')}>
              <rect x="643" y="436" width="30" height="70" rx="15" fill="#D9D9D9"/>
              <text x="658" y="475" textAnchor="middle" fontSize="14" transform="rotate(-90 658 475)" className={textClass} style={textStyle}>MUX</text>
            </g>

            <g {...getGroupProps('mux_memtoreg')}>
              <rect x="1058" y="410" width="30" height="70" rx="15" fill="#D9D9D9"/>
              <text x="1073" y="449" textAnchor="middle" fontSize="14" transform="rotate(-90 1073 449)" className={textClass} style={textStyle}>MUX</text>
            </g>

            <g {...getGroupProps('mux_regdst')}>
              <rect x="360" y="403" width="30" height="70" rx="15" fill="#D9D9D9"/>
              <text x="375" y="442" textAnchor="middle" fontSize="14" transform="rotate(-90 375 442)" className={textClass} style={textStyle}>MUX</text>
            </g>

            {/* =========================================
                CONTROL SIGNAL LABELS
                ========================================= */}
            <g id="control_labels" className="font-mono italic font-bold text-sm tracking-wide" style={{ fill: '#0284c7', pointerEvents: 'none', userSelect: 'none' }}>
              <text x="200" y="340" transform="rotate(-90 370 340)">RegDst</text>
              <text x="653" y="340" transform="rotate(-90 653 340)">ALUSrc</text>
              <text x="1068" y="340" transform="rotate(-90 1068 340)">MemtoReg</text>
              <text x="440" y="300">RegWrite</text>
              <text x="670" y="175">Branch</text>
              <text x="700" y="550">ALUOp</text>
              <text x="900" y="385">MemWrite</text>
              <text x="900" y="530">MemRead</text>
              <text x="235" y="155">4</text>
            </g>

          </svg>
        </div>
      </div>
    </div>
  );
}