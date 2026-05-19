import { useDiagramStore } from '../store/diagramStore';

export default function InstructionPanel() {
  const { 
    setActiveWires,
    setActiveInstruction,
    clearWires, 
    interactionMode, 
    setInteractionMode,
    userSelectedWires
  } = useDiagramStore();

  const handleCheckAnswers = () => {
    // In the future, you will map specific instructions to their correct arrays
    alert(`You selected ${userSelectedWires.length} wires! Comparison logic coming soon.`);
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-screen z-20 shadow-xl overflow-y-auto">
      
      {/* MODE SELECTOR */}
      <div className="bg-slate-950 p-1 rounded-lg flex gap-1 mb-8">
        <button 
          onClick={() => setInteractionMode('explore')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${interactionMode === 'explore' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Explore
        </button>
        <button 
          onClick={() => setInteractionMode('practice_click')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${interactionMode === 'practice_click' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Practice
        </button>
      </div>

      {interactionMode === 'practice_click' && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-2 text-white border-b border-slate-700 pb-2">Trace the Path</h2>
          <p className="text-sm text-purple-300 mb-4">Click the wires on the diagram that would be active for an <strong>ADD</strong> instruction.</p>
          
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-sm text-slate-300 mb-4">
            Wires Selected: <span className="font-bold text-purple-400">{userSelectedWires.length}</span>
          </div>

          <button 
            onClick={handleCheckAnswers}
            className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg"
          >
            Check Answers
          </button>
        </div>
      )}


      <div className="flex flex-col gap-3">

        {/* R-Type (ADD) Example */}
        <button 
          onClick={() => {
            setActiveWires(
              ['wire_1', 'wire_2', 'wire_3', 'wire_4', 'wire_6', 'wire_7', 'wire_8', 'wire_11', 'wire_12', 'wire_14', 'wire_15', 'wire_19', 'wire_21', 'wire_22', 'wire_33', 'wire_37', 'wire_38'],
              ['wire_5', 'wire_23', 'wire_30', 'wire_36']
            )
              setActiveInstruction('add');
            }  
          } 
          className="bg-sky-600 hover:bg-sky-500 text-white py-3 px-4 rounded-lg text-left font-mono text-sm transition-colors shadow-lg"
        >
           add $t0, $s1, $s2
        </button>

        {/* R-Type (ADDI) Example */}
        <button 
          onClick={() => {
            setActiveWires(
              ['wire_1', 'wire_2', 'wire_4', 'wire_6', 'wire_7', 'wire_8', 'wire_9', 'wire_10', 'wire_12', 'wire_14', 'wire_15', 'wire_20', 'wire_21', 'wire_22', 'wire_33', 'wire_35'],
              ['wire_23', 'wire_30', 'wire_31', 'wire_36']
            )
              setActiveInstruction('addi');
            }            
          } 
          className="bg-sky-600 hover:bg-sky-500 text-white py-3 px-4 rounded-lg text-left font-mono text-sm transition-colors shadow-lg"
        >
          addi $t0, $t1, 100
        </button>

        {/* Load Word Example */}
        <button 
          onClick={() => {
            setActiveWires(
              ['wire_1', 'wire_2', 'wire_4', 'wire_6', 'wire_7', 'wire_8', 'wire_9', 'wire_10', 'wire_12', 'wire_14', 'wire_15', 'wire_20', 'wire_21', 'wire_22', 'wire_33', 'wire_37', 'wire_38'],
              ['wire_23', 'wire_24', 'wire_29', 'wire_30', 'wire_31', 'wire_36']
            )
              setActiveInstruction('lw');
            }
          } 
          className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg text-left font-mono text-sm transition-colors shadow-lg"
        >
          lw $t0, 4($s1)
        </button>

        {/* Store Word Example */}
        <button 
          onClick={() => {
            setActiveWires(
                ['wire_1', 'wire_2', 'wire_3', 'wire_4', 'wire_6', 'wire_7', 'wire_8', 'wire_10', 'wire_14', 'wire_15', 'wire_20', 'wire_21', 'wire_22', 'wire_34', 'wire_37', 'wire_38'],
                ['wire_28', 'wire_30', 'wire_31', 'wire_36'],
              )
            setActiveInstruction('sw');
            }
          } 
          className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg text-left font-mono text-sm transition-colors shadow-lg"
        >
          sw $t0, 4($s1)
        </button>

        {/* Branch Example */}
        <button 
          onClick={() => {
            setActiveWires(
              ['wire_1', 'wire_2', 'wire_3', 'wire_4', 'wire_6', 'wire_7', 'wire_8', 'wire_10', 'wire_13', 'wire_14', 'wire_15', 'wire_16', 'wire_17', 'wire_18', 'wire_20', 'wire_21', 'wire_22', 'wire_26', 'wire_27'],
              ['wire_25', 'wire_30', 'wire_36'],
            )
            setActiveInstruction('beq');
            } 
          } 
          className="bg-orange-600 hover:bg-orange-500 text-white py-3 px-4 rounded-lg text-left font-mono text-sm transition-colors shadow-lg"
        >
          beq $s1, $s2, Label
        </button>

        <button 
          onClick={clearWires}
          className="mt-8 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded text-center text-sm transition-colors border border-slate-600"
        >
          Turn Off Lights
        </button>
      </div>
      </div>
  );
}