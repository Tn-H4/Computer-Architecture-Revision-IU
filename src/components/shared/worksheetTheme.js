/** Shared theme class maps for worksheet chapters */
export function getWorksheetTheme(isDark) {
  return {
    containerBg: isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800',
    cardBg: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300',
    inputBg: isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900',
    answerKeyBg: isDark ? 'bg-emerald-900/20 border-emerald-700/40 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-800',
    title: isDark ? 'text-blue-400' : 'text-blue-600',
    stepHeader: isDark ? 'text-emerald-400' : 'text-emerald-700',
    yellowBox: isDark ? 'text-amber-400 bg-amber-900/40 border-transparent' : 'text-amber-700 bg-amber-100 border-amber-300',
    blueBox: isDark ? 'bg-blue-900/20 border-blue-800 text-slate-200' : 'bg-blue-50 border-blue-200 text-slate-800',
    blueBoxText: isDark ? 'text-blue-300' : 'text-blue-800',
    greenBox: isDark ? 'bg-emerald-900/20 border-emerald-800 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-800',
    greenBoxText: isDark ? 'text-emerald-400' : 'text-emerald-800',
    code: isDark ? 'bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded' : 'bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded',
    redText: isDark ? 'text-red-400' : 'text-red-600',
  };
}
