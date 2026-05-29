import React, { useState, useEffect } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { SunIcon, MoonIcon } from './Icons';
import { DndContext, useDraggable, useDroppable, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import Xarrow, { Xwrapper } from 'react-xarrows'; 

const XarrowComponent = Xarrow.default || Xarrow;

// --- CONFIGURATION ---
const TOOLS = [
  { id: 'IM', label: 'IM', style: 'bg-blue-500 text-white border-blue-600 shadow-sm' },
  { id: 'Reg1', label: 'Reg', style: 'bg-green-500 text-white border-green-600 shadow-sm' },
  { id: 'ALU', label: 'ALU', style: 'bg-rose-500 text-white border-rose-600 shadow-sm' },
  { id: 'DM', label: 'DM', style: 'bg-purple-500 text-white border-purple-600 shadow-sm' },
  { id: 'Reg2', label: 'Reg', style: 'bg-teal-500 text-white border-teal-600 shadow-sm' },
  { id: 'Stall', label: 'Stall', style: 'bg-transparent text-slate-500 border-2 border-dashed border-slate-400' },
];

const INITIAL_INSTRUCTIONS = [
  'lw $t1, 0($t0)', 'lw $t2, 4($t0)', 'add $t3, $t1, $t2', 'sw $t3, 12($t0)', 
  'lw $t4, 8($t0)', 'sub $t5, $t1, $t3', 'and $t6, $t2, $t4', 'or $t7, $t5, $t6', 
  'slt $t8, $t6, $t7', 'beq $t1, $t2, label'
];

// --- HELPER COMPONENTS ---

const DraggableTool = ({ tool, menuType }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbox-${menuType}-${tool.id}`, 
    data: { type: tool.id, source: 'toolbox' }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: 'none' }}
      className={`flex items-center justify-center text-xs font-bold rounded-md border cursor-grab active:cursor-grabbing shrink-0 select-none touch-none w-14 h-10 sm:w-16 sm:h-12 lg:w-10 lg:h-10 ${tool.style}`}
    >
      {tool.label}
    </div>
  );
};
const DraggableGridItem = ({ type, rowId, colId, isSelected, onSelect, isForwardingMode, arrowStart }) => {
  const tool = TOOLS.find(t => t.id === type);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `grid-${rowId}-${colId}`,
    data: { type, source: 'grid', row: rowId, col: colId },
    disabled: isForwardingMode 
  });

  if (!tool) return null;

  if (isDragging) {
    return <div className="w-[90%] h-[85%] rounded-md bg-slate-200 dark:bg-slate-700 opacity-50 border-2 border-dashed border-slate-400"></div>;
  }

  const isStartingPoint = arrowStart?.row === rowId && arrowStart?.col === colId;
  const highlightStyle = isStartingPoint ? 'ring-4 ring-amber-500 animate-pulse' : (isSelected && !isForwardingMode ? 'ring-4 ring-blue-500 ring-offset-1 shadow-lg' : '');

  return (
    <div
      ref={setNodeRef}
      id={`block-${rowId}-${colId}`} 
      {...(isForwardingMode ? {} : listeners)} 
      {...(isForwardingMode ? {} : attributes)}
      onClick={(e) => onSelect(e, rowId, colId, true)}
      style={{ touchAction: 'none' }}
      className={`w-[90%] h-[85%] relative flex items-center justify-center font-bold text-sm rounded-md border select-none touch-none
        ${isForwardingMode ? 'cursor-crosshair hover:ring-2 hover:ring-amber-400' : 'cursor-grab active:cursor-grabbing'} 
        ${tool.style} ${highlightStyle}`}
    >
      {tool.label}
    </div>
  );
};

const GridCell = ({ rowId, colId, value, theme, isSelected, onSelect, isForwardingMode, exerciseMode, arrowStart }) => {
  const { isOver, setNodeRef } = useDroppable({ id: `${rowId}-${colId}` });
  
  const hoverBg = isOver ? (theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200') : '';
  const cellBorder = theme === 'dark' ? 'border-slate-700' : 'border-slate-300';
  const cellBg = theme === 'dark' ? 'bg-slate-900' : 'bg-white';

  const emptySelectionStyle = (isSelected && !value) 
    ? (theme === 'dark' ? 'bg-blue-900/40 ring-inset ring-2 ring-blue-500/50' : 'bg-blue-50 ring-inset ring-2 ring-blue-400/50') 
    : '';

  const needsPipelineReg = exerciseMode === 'forwarding' && value && ['IM', 'Reg1', 'ALU', 'DM'].includes(value);

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => onSelect(e, rowId, colId, false)}
      className={`relative w-20 h-14 shrink-0 border-r border-b flex items-center justify-center transition-colors ${cellBorder} ${cellBg} ${hoverBg} ${emptySelectionStyle}`}
    >
      {value && (
        <DraggableGridItem 
          type={value} 
          rowId={rowId} 
          colId={colId} 
          isSelected={isSelected} 
          onSelect={onSelect} 
          isForwardingMode={isForwardingMode} 
          arrowStart={arrowStart}             
        />
      )}

      {needsPipelineReg && (
        <div 
          id={`pipe-reg-${rowId}-${colId}`}
          className={`absolute -right-[5px] top-[-4px] bottom-[-4px] w-[10px] z-10 border shadow-sm pointer-events-none transition-colors ${
            theme === 'dark' ? 'bg-cyan-600 border-cyan-400' : 'bg-cyan-300 border-cyan-500'
          }`} 
        />
      )}
    </div>
  );
};

const TrashBin = ({ theme }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'trash' });
  
  return (
    <div
      ref={setNodeRef}
      title="Drag items here to delete"
      className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border shrink-0 ${
        isOver 
          ? 'bg-red-500 border-red-600 text-white scale-110' 
          : theme === 'dark' 
            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400' 
            : 'bg-white border-slate-200 text-slate-500 hover:text-red-500'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </div>
  );
};

// --- SCROLLBAR STYLES ---
const ScrollbarStyles = ({ theme }) => (
  <style>{`
    .pipeline-grid::-webkit-scrollbar { width: 12px; height: 12px; }
    .pipeline-grid::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}; border-radius: 8px; }
    .pipeline-grid::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#475569' : '#94a3b8'}; border-radius: 8px; border: 3px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}; }
    .pipeline-grid::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#64748b' : '#64748b'}; }
    .pipeline-grid::-webkit-scrollbar-corner { background: ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}; }
  `}</style>
);

// --- MAIN COMPONENT ---

export default function Chapter4_2({ externalInstructions, setExternalInstructions, externalGrid, setExternalGrid, exerciseMode, setExerciseMode, onToggleSidebar }) {
  const { theme, toggleTheme, toggleMenu } = useDiagramStore();
  
  const instructions = externalInstructions?.length > 0 ? externalInstructions : INITIAL_INSTRUCTIONS;
  
  const grid = externalGrid || Array(10).fill(null).map(() => Array(20).fill(null));
  const setGrid = setExternalGrid || (() => {});
  
  const [activeDragData, setActiveDragData] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [lastSelectedCell, setLastSelectedCell] = useState(null); 
  const [clipboard, setClipboard] = useState([]); 

  const [isForwardingMode, setIsForwardingMode] = useState(false);
  const [forwardingPaths, setForwardingPaths] = useState([]); 
  const [arrowStart, setArrowStart] = useState(null); 
  
  const [showHelp, setShowHelp] = useState(false);
  const [isInstColumnCollapsed, setIsInstColumnCollapsed] = useState(false);
  const [collapsedRows, setCollapsedRows] = useState(new Set());

  const sensors = useSensors(
    useSensor(MouseSensor, { 
      activationConstraint: { distance: 5 } // Mouse starts dragging after 5 pixels
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        tolerance: 8
      } 
    })
  );

  const handleModeSwitch = (mode) => {
    if (setExerciseMode) setExerciseMode(mode);
    if (mode === 'stall') {
      setIsForwardingMode(false); 
      setArrowStart(null);
    }
  };

  const handleAddRow = () => {
    if (setExternalInstructions) {
       setExternalInstructions(prev => [...prev, '']);
    }
    setGrid(prev => [...prev, Array(prev[0].length).fill(null)]);
  };

  const handleInstructionChange = (index, newValue) => {
    if (setExternalInstructions) {
      setExternalInstructions(prev => {
        const newInst = [...prev];
        newInst[index] = newValue;
        return newInst;
      });
    }
  };

  const handleAddColumn = () => {
    setGrid(prev => prev.map(row => [...row, null]));
  };

  const toggleCollapse = (rowIndex) => {
    setCollapsedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key.toLowerCase() === 'c') {
        if (selectedCells.length === 0) return;
        const minRow = Math.min(...selectedCells.map(c => c.row));
        const minCol = Math.min(...selectedCells.map(c => c.col));

        const copiedItems = selectedCells.map(c => ({
          rOffset: c.row - minRow,
          cOffset: c.col - minCol,
          type: grid[c.row][c.col]
        })).filter(item => item.type !== null); 

        setClipboard(copiedItems);
        
      } else if (e.key.toLowerCase() === 'v') {
        if (clipboard.length === 0 || selectedCells.length === 0) return;

        const anchorRow = Math.min(...selectedCells.map(c => c.row));
        const anchorCol = Math.min(...selectedCells.map(c => c.col));
        const newlySelected = [];

        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => [...row]); 
          const numRows = prevGrid.length;
          const numCols = prevGrid[0].length;

          clipboard.forEach(item => {
            const targetRow = anchorRow + item.rOffset;
            const targetCol = anchorCol + item.cOffset;

            if (targetRow >= 0 && targetRow < numRows && targetCol >= 0 && targetCol < numCols) {
              newGrid[targetRow][targetCol] = item.type;
              newlySelected.push({ row: targetRow, col: targetCol });
            }
          });
          return newGrid;
        });

        if (newlySelected.length > 0) setSelectedCells(newlySelected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCells, grid, clipboard]); 

  const handleSelect = (e, row, col, isItem) => {
    e.stopPropagation(); 

    if (isForwardingMode && isItem) {
      if (!arrowStart) {
        setArrowStart({ row, col });
      } else {
        if (arrowStart.row !== row || arrowStart.col !== col) {
          setForwardingPaths(prev => [...prev, { from: arrowStart, to: { row, col } }]);
        }
        setArrowStart(null); 
      }
      return;
    }

    if (!isForwardingMode) {
      if (e.shiftKey && lastSelectedCell) {
        const minRow = Math.min(lastSelectedCell.row, row);
        const maxRow = Math.max(lastSelectedCell.row, row);
        const minCol = Math.min(lastSelectedCell.col, col);
        const maxCol = Math.max(lastSelectedCell.col, col);

        setSelectedCells((prev) => {
          let newSelection = [...prev];
          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              if (!newSelection.some((cell) => cell.row === r && cell.col === c)) {
                newSelection.push({ row: r, col: c });
              }
            }
          }
          return newSelection;
        });
      } else if (e.ctrlKey || e.metaKey) {
        setSelectedCells(prev => {
          const exists = prev.some(c => c.row === row && c.col === col);
          if (exists) return prev.filter(c => !(c.row === row && c.col === col));
          return [...prev, { row, col }];
        });
        setLastSelectedCell({ row, col }); 
      } else {
        setSelectedCells([{ row, col }]);
        setLastSelectedCell({ row, col }); 
      }
    }
  };

  const handleDragStart = (event) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragData(null);

    if (!over) return; 

    const sourceData = active.data.current;
    
    if (over.id === 'trash') {
      if (sourceData.source === 'grid') {
        const isDraggedItemSelected = selectedCells.some(c => c.row === sourceData.row && c.col === sourceData.col);
        
        const trashedCells = isDraggedItemSelected 
          ? selectedCells 
          : [{ row: sourceData.row, col: sourceData.col }];

        setForwardingPaths(prev => prev.filter(path => {
          const fromDeleted = trashedCells.some(c => c.row === path.from.row && c.col === path.from.col);
          const toDeleted = trashedCells.some(c => c.row === path.to.row && c.col === path.to.col);
          return !fromDeleted && !toDeleted; 
        }));

        setGrid((prevGrid) => {
          const newGrid = prevGrid.map(row => [...row]);
          trashedCells.forEach(cell => { newGrid[cell.row][cell.col] = null; });
          return newGrid;
        });

        if (isDraggedItemSelected) setSelectedCells([]); 
      }
      return;
    }

    if (typeof over.id === 'string' && over.id.includes('-')) {
      const [targetRow, targetCol] = over.id.split('-').map(Number);
      
      if (sourceData.source === 'toolbox') {
        if (grid[targetRow][targetCol] !== null) return; 

        setGrid((prevGrid) => {
          const newGrid = prevGrid.map(row => [...row]);
          newGrid[targetRow][targetCol] = sourceData.type;
          return newGrid;
        });
        setSelectedCells([{ row: targetRow, col: targetCol }]);
        return;
      }

      if (sourceData.source === 'grid') {
        const isDraggedItemSelected = selectedCells.some(c => c.row === sourceData.row && c.col === sourceData.col);
        
        let itemsToMove = [];
        if (isDraggedItemSelected) {
          itemsToMove = selectedCells.map(c => ({ row: c.row, col: c.col, type: grid[c.row][c.col] }));
        } else {
          itemsToMove = [{ row: sourceData.row, col: sourceData.col, type: sourceData.type }];
          setSelectedCells([]); 
        }

        const rowOffset = targetRow - sourceData.row;
        const colOffset = targetCol - sourceData.col;

        const numRows = grid.length;
        const numCols = grid[0].length;

        const canMove = itemsToMove.every(item => {
          const newR = item.row + rowOffset;
          const newC = item.col + colOffset;
          
          if (newR < 0 || newR >= numRows || newC < 0 || newC >= numCols) return false;

          const targetOccupant = grid[newR][newC];
          if (targetOccupant !== null) {
            const isOccupantMoving = itemsToMove.some(m => m.row === newR && m.col === newC);
            if (!isOccupantMoving) return false; 
          }
          return true;
        });

        if (!canMove) return; 

        setForwardingPaths(prevPaths => prevPaths.map(path => {
          let newFrom = { ...path.from };
          let newTo = { ...path.to };

          const movingFromItem = itemsToMove.find(m => m.row === path.from.row && m.col === path.from.col);
          if (movingFromItem) {
            newFrom = { row: movingFromItem.row + rowOffset, col: movingFromItem.col + colOffset };
          }

          const movingToItem = itemsToMove.find(m => m.row === path.to.row && m.col === path.to.col);
          if (movingToItem) {
            newTo = { row: movingToItem.row + rowOffset, col: movingToItem.col + colOffset };
          }

          return { from: newFrom, to: newTo };
        }));

        setGrid((prevGrid) => {
          const newGrid = prevGrid.map(row => [...row]);
          itemsToMove.forEach(item => { newGrid[item.row][item.col] = null; });
          itemsToMove.forEach(item => { newGrid[item.row + rowOffset][item.col + colOffset] = item.type; });
          return newGrid;
        });

        if (isDraggedItemSelected) {
          setSelectedCells(itemsToMove.map(item => ({
            row: item.row + rowOffset,
            col: item.col + colOffset
          })));
        }
      }
    }
  };

  const handleClearAll = () => {
    setGrid(Array(10).fill(null).map(() => Array(20).fill(null)));
  };

  const activeTool = activeDragData ? TOOLS.find(t => t.id === activeDragData.type) : null;
  const isDraggingGroup = activeDragData?.source === 'grid' && selectedCells.some(c => c.row === activeDragData.row && c.col === activeDragData.col) && selectedCells.length > 1;
  const borderTheme = theme === 'dark' ? 'border-slate-700' : 'border-slate-300';
  const headerBg = theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100';

  const overlayClass = activeDragData?.source === 'toolbox'
    ? 'w-14 h-10 sm:w-16 sm:h-12' 
    : 'w-[72px] h-[48px]'; 

  return (
    <div className={`w-full h-screen relative flex flex-col min-h-0 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <ScrollbarStyles theme={theme} />
      
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false}>
        
        {/* ================= DESKTOP (OLD DESIGN) FLOATING HEADER ================= */}
        <div className="hidden lg:flex absolute top-4 left-4 right-4 items-center justify-between z-40 pointer-events-none">
          
          <div className="flex gap-3 pointer-events-auto">
            <button onClick={toggleMenu} className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>            
            <button onClick={toggleTheme} className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}>
              {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            
            <div className={`flex p-1 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
              <button
                onClick={() => handleModeSwitch('stall')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  exerciseMode === 'stall' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Stalls
              </button>
              <button
                onClick={() => handleModeSwitch('forwarding')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  exerciseMode === 'forwarding' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Forwarding
              </button>
            </div>

            {exerciseMode === 'forwarding' && (
              <button 
                onClick={() => { setIsForwardingMode(!isForwardingMode); setArrowStart(null); setSelectedCells([]); }} 
                className={`px-4 h-10 flex items-center justify-center font-bold text-sm rounded-md shadow-md transition-colors border ${
                  isForwardingMode ? 'bg-amber-500 border-amber-600 text-white animate-pulse' : (theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-200')
                }`}
              >
                {isForwardingMode ? 'Drawing Arrows...' : 'Draw Arrows'}
              </button>
            )}
            
            {forwardingPaths.length > 0 && (
               <button 
                 onClick={() => setForwardingPaths([])}
                 className={`px-4 h-10 flex items-center justify-center gap-2 font-bold text-sm rounded-md shadow-md transition-all duration-150 border pointer-events-auto hover:scale-105 active:scale-95 ${
                   theme === 'dark' ? 'bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/30' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                 }`}
               >
                 Clear
               </button>
            )}
          </div>

          <div className={`flex gap-3 p-2 rounded-xl border shadow-sm backdrop-blur-sm pointer-events-auto ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
            <span className={`flex items-center text-sm font-semibold px-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Toolbox:
            </span>
            {TOOLS.map(tool => (
              <DraggableTool key={`desktop-${tool.id}`} tool={tool} menuType="desktop" />
            ))}
          </div>
          
          <div className="flex items-center gap-3 pointer-events-auto">
            
            <button
              onClick={() => setShowHelp(true)}
              title="Controls Help"
              className={`w-10 h-10 flex items-center justify-center rounded-md shadow-md transition-colors border hover:scale-105 ${
                theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-blue-400' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-blue-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <TrashBin theme={theme} />
          </div>
        </div>

        {/* ================= MOBILE (2 SOLID LAYERS) HEADER ================= */}
        <div className="lg:hidden flex flex-col shrink-0 z-30">
          
          <div className={`p-3 border-b flex flex-row items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <button onClick={toggleMenu} className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h2 className={`font-bold hidden sm:block ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Pipeline</h2>
            </div>
            
            <div className={`p-1 rounded-lg flex gap-1 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
              <button 
                onClick={() => handleModeSwitch('stall')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  exerciseMode === 'stall' ? 'bg-blue-600 text-white shadow-sm' : `hover:text-blue-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`
                }`}
              >
                Stalls
              </button>
              <button 
                onClick={() => handleModeSwitch('forwarding')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  exerciseMode === 'forwarding' ? 'bg-emerald-600 text-white shadow-sm' : `hover:text-emerald-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`
                }`}
              >
                Forwarding
              </button>
            </div>

            <button onClick={toggleTheme} className={`w-10 h-10 flex items-center justify-center rounded-md shadow-sm transition-colors border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
               {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            <button 
                onClick={onToggleSidebar}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors border shadow-sm shrink-0 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
          </div>

          <div className={`p-3 border-b flex flex-row items-center justify-between gap-3 overflow-x-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Toolbox:
              </span>
              {TOOLS.map((tool) => (
                <DraggableTool key={`mobile-${tool.id}`} tool={tool} menuType="mobile" />
              ))}
            </div>

            <div className={`flex items-center gap-2 pl-3 border-l shrink-0 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              {exerciseMode === 'forwarding' && (
                <>
                  <button 
                    onClick={() => { setIsForwardingMode(!isForwardingMode); setArrowStart(null); setSelectedCells([]); }} 
                    className={`px-3 h-10 flex items-center justify-center font-bold text-xs rounded-md shadow-sm transition-colors border ${
                      isForwardingMode ? 'bg-amber-500 border-amber-600 text-white animate-pulse' : (theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-200')
                    }`}
                  >
                    {isForwardingMode ? 'Drawing...' : 'Draw'}
                  </button>
                  {forwardingPaths.length > 0 && (
                     <button 
                       onClick={() => setForwardingPaths([])}
                       className={`px-3 h-10 flex items-center justify-center font-bold text-xs rounded-md shadow-sm transition-colors border ${
                         theme === 'dark' ? 'bg-rose-950/30 border-rose-900/50 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
                       }`}
                     >
                       Clear
                     </button>
                  )}
                </>
              )}
              
              <TrashBin theme={theme} />
              
            </div>
          </div>
        </div>

        {/* ================= GRID AREA ================= */}
        <div 
          className="flex-1 min-h-0 min-w-0 flex flex-col p-4 sm:p-6 lg:pt-24"
          onClick={() => { setSelectedCells([]); setArrowStart(null); }} 
        >
          <div className={`pipeline-grid flex-1 min-h-0 min-w-0 overflow-scroll rounded-lg shadow-inner border ${borderTheme} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <Xwrapper>
              
              {/* Arrow Logic */}
              {forwardingPaths.map((path, index) => {
                const sourceValue = grid[path.from.row] && grid[path.from.row][path.from.col];
                const hasSourcePipeReg = sourceValue && ['IM', 'Reg1', 'ALU', 'DM'].includes(sourceValue);
                const startPoint = hasSourcePipeReg ? `pipe-reg-${path.from.row}-${path.from.col}` : `block-${path.from.row}-${path.from.col}`;

                const targetValue = grid[path.to.row] && grid[path.to.row][path.to.col];
                const hasTargetPipeReg = targetValue && ['IM', 'Reg1', 'ALU', 'DM'].includes(targetValue);
                const endPoint = hasTargetPipeReg ? `pipe-reg-${path.to.row}-${path.to.col}` : `block-${path.to.row}-${path.to.col}`;

                return (
                  <XarrowComponent
                    key={index}
                    start={startPoint}
                    end={endPoint}
                    end={`block-${path.to.row}-${path.to.col}`}
                    color={theme === 'dark' ? '#ffffff' : '#000000'} 
                    strokeWidth={3}
                    path="straight" 
                    headSize={4}
                    startAnchor={{ position: "top", offset: { y: 25 } }} 
                    endAnchor={{ position: "top", offset: { x: -30 } }}   
                    zIndex={20}
                  />
                );
              })}
              
              <div className="flex flex-col w-fit">
                
                {/* STICKY HEADER ROW */}
                <div className="flex sticky top-0 z-20 w-fit">
                  
                  <div className={`shrink-0 sticky left-0 z-30 border-r border-b ${borderTheme} ${headerBg} flex items-center shadow-[2px_2px_5px_rgba(0,0,0,0.1)] transition-all overflow-hidden ${isInstColumnCollapsed ? 'w-12 justify-center px-1' : 'w-48 sm:w-56 px-4'}`}>
                    {!isInstColumnCollapsed && <span className="font-bold py-3 text-sm tracking-wider uppercase mr-auto">Instruction</span>}
                    <button 
                      onClick={() => setIsInstColumnCollapsed(!isInstColumnCollapsed)}
                      className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}
                      title={isInstColumnCollapsed ? "Expand Column" : "Collapse Column"}
                    >
                      <svg className={`w-4 h-4 transition-transform ${isInstColumnCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>

                  {grid[0].map((_, i) => (
                    <div key={i} className={`w-20 shrink-0 flex justify-center items-center font-bold border-r border-b py-3 ${borderTheme} ${headerBg}`}>
                      CC{i + 1}
                    </div>
                  ))}

                  <button
                    onClick={handleAddColumn}
                    className={`w-20 shrink-0 flex justify-center items-center font-bold border-r border-b py-3 cursor-pointer transition-colors ${borderTheme} ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    + CC
                  </button>
                </div>

                {/* GRID ROWS */}
                <div className="flex flex-col w-fit pb-10">
                  {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      
                      <div className={`shrink-0 sticky left-0 z-20 font-mono px-2 flex items-center border-r border-b shadow-[2px_0_5px_rgba(0,0,0,0.05)] transition-all overflow-hidden ${borderTheme} ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} ${isInstColumnCollapsed ? 'w-12 justify-center px-1' : 'w-48 sm:w-56'}`}>
                        
                        <span className={`text-xs font-bold select-none ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} ${!isInstColumnCollapsed && 'mr-2'}`}>
                          I{rowIndex + 1}
                        </span>

                        {!isInstColumnCollapsed && (
                          <input
                            type="text"
                            value={instructions[rowIndex] || ''}
                            onChange={(e) => handleInstructionChange(rowIndex, e.target.value)}
                            className={`w-full bg-transparent outline-none border-none text-sm focus:ring-2 focus:ring-blue-500 rounded px-1 py-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                            placeholder={`Instruction ${rowIndex + 1}`}
                          />
                        )}

                      </div>

                      <div className="flex">
                        {row.map((cellValue, colIndex) => {
                          const isSelected = selectedCells.some(c => c.row === rowIndex && c.col === colIndex);
                          return (
                            <GridCell 
                              key={colIndex} 
                              rowId={rowIndex} 
                              colId={colIndex} 
                              value={cellValue} 
                              theme={theme} 
                              isSelected={isSelected}
                              onSelect={handleSelect}
                              isForwardingMode={isForwardingMode}
                              exerciseMode={exerciseMode}
                              arrowStart={arrowStart}            
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex">
                    <button
                      onClick={handleAddRow}
                      className={`h-14 shrink-0 sticky left-0 z-20 font-bold text-sm flex items-center justify-center border-r border-b shadow-[2px_0_5px_rgba(0,0,0,0.05)] transition-all cursor-pointer ${borderTheme} ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} ${isInstColumnCollapsed ? 'w-12' : 'w-48 sm:w-56'}`}
                    >
                      {isInstColumnCollapsed ? '+' : '+ Add Instruction'}
                    </button>
                  </div>
                  
                </div>
              </div>
            </Xwrapper>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTool ? (
            <div 
              className={`relative flex items-center justify-center font-bold text-xs rounded-md border shadow-2xl opacity-90 ${activeTool.style} ${
                activeDragData?.source === 'toolbox' 
                  ? 'w-14 h-10 sm:w-16 sm:h-12 lg:w-10 lg:h-10' 
                  : 'w-[72px] h-[48px]'
              }`}
            >
              {activeTool.label}
              
              {isDraggingGroup && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                  +{selectedCells.length - 1}
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>

      {/* --- INSTRUCTIONS / HELP MODAL --- */}
      {showHelp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto px-4" 
          onClick={() => setShowHelp(false)}
        >
          <div 
            className={`p-6 rounded-xl shadow-2xl max-w-sm w-full border animate-in zoom-in-95 duration-200 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`} 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 border-b pb-3 border-slate-500/20">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Grid Controls
              </h2>
              <button onClick={() => setShowHelp(false)} className={`hover:text-rose-500 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <ul className={`space-y-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-center gap-3">
                <kbd className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>Click</kbd>
                <span>Select a single block or cell.</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>Shift + Click</kbd>
                <span>Square select multiple blocks.</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>Ctrl/Cmd + C</kbd>
                <span>Copy selected blocks.</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>click</kbd>
                <span>Click on a target cell.</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>Ctrl/Cmd + V</kbd>
                <span>Paste copied blocks to a target cell.</span>
              </li>
              <li className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-500/20">
                <div className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-sm border flex items-center justify-center gap-1 ${theme === 'dark' ? 'bg-blue-900/50 border-blue-800 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-700'}`}>
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   Drag to Trash
                </div>
                <span>Delete selected blocks.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}