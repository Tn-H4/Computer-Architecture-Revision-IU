import React from 'react';
import { DiceIcon } from './WorksheetIcons';

export default function PracticeTestToolbar({
  mode,
  isDark,
  onModeChange,
  onRandomize,
  randomizeLabel = 'Randomize Numbers',
  extraButtons = null,
}) {

  return (
    <div className="flex gap-4 items-center flex-wrap justify-end">
      {extraButtons}
      {onRandomize && (
        <button
          onClick={onRandomize}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
        >
          <DiceIcon /> {randomizeLabel}
        </button>
      )}
      <div className={`flex p-1 rounded-lg shadow-sm ${isDark ? 'bg-slate-800' : 'bg-slate-200/80 border border-slate-300'}`}>
        <button
          onClick={() => onModeChange('practice')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'practice' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Practice Mode
        </button>
        <button
          onClick={() => onModeChange('test')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'test' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Test Mode
        </button>
      </div>
    </div>
  );
}
