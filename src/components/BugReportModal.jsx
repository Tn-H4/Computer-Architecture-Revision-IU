import React from 'react';
import { useDiagramStore } from '../store/diagramStore';

export default function BugReportModal() {
  const { isBugModalOpen, setBugModalOpen, theme } = useDiagramStore();

  if (!isBugModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setBugModalOpen(false)}
      />

      {/* The Popup Card */}
      <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl transform transition-all ${
        theme === 'dark' ? 'bg-slate-900 border border-slate-700 text-slate-200' : 'bg-white border border-slate-200 text-slate-800'
      }`}>
        
        {/* Warning Header */}
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold">Before you report...</h2>
        </div>

        {/* Your custom warning message */}
        <div className={`mb-6 space-y-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          <p>Please make sure to check the following before submitting a bug:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The website only supports for laptop, no phone or ipad.</li>
            <li>Question: Would it supports in the future?</li>
            <li>Maybe, for the meantime, nope.</li>
            <li>Question: Why is the line so hard to click?</li>
            <li>There are too many line that sometime they overlay each other.</li>
            <li>Can it be fix? Yes. Would it be fixed? Probably not. Why? I'm lazy</li>
          </ul>
          <p className="pt-2 font-medium">When filling out the form, please include exactly which chapter you were on!</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={() => setBugModalOpen(false)}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Cancel
          </button>
          
          <a 
            href="https://forms.gle/yfHfPUdGsn7S7mqv9" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => setBugModalOpen(false)} /* Closes popup after they click link */
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            Proceed to Google Form
          </a>
        </div>
      </div>
    </div>
  );
}