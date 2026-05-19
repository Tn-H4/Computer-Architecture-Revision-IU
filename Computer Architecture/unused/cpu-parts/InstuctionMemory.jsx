export default function InstMemo({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('instruction_memory')}>
          <rect x="133" y="311" width="112" height="116" fill="#D9D9D9"/>
          {hoveredComponent === 'instruction_memory' ? (
            <>
              <rect x="133" y="311" width="112" height="116" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
              <text x="138" y="335" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>Read</text>
              <text x="138" y="350" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>address</text>
              <text x="240" y="375" textAnchor="end" fontSize="14" className={textClass} style={textStyle}>Instruction</text>
              <text x="189" y="415" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>Instr. Memory</text>
            </>
          ) : (
            <>
              <text x="189" y="363" textAnchor="middle" fontSize="18" className={textClass} style={textStyle}>Instruction</text>
              <text x="189" y="389" textAnchor="middle" fontSize="18" className={textClass} style={textStyle}>memory</text>
            </>
          )}
        </g>
  );
}