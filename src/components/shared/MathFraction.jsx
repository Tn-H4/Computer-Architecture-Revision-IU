import React from 'react';

export default function MathFraction({ num, den, isDark }) {
  return (
    <span className="inline-flex flex-col items-center justify-center align-middle mx-2 text-base">
      <span className={`border-b pb-0.5 px-2 ${isDark ? 'border-emerald-400' : 'border-emerald-600'}`}>{num}</span>
      <span className="pt-0.5 px-2">{den}</span>
    </span>
  );
}
