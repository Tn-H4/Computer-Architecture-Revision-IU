export default function ALU({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('alu')}>
          <path d="M737.5 303L827.5 345.5V428.5L737.5 471.5V413.5L777.5 387L737.5 360V303Z" fill="#D9D9D9"/>
          {hoveredComponent === 'alu' ? (
            <>
              {/* Highlight Border */}
              <path d="M737.5 303L827.5 345.5V428.5L737.5 471.5V413.5L777.5 387L737.5 360V303Z" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
              
              {/* Pin Labels */}
              <text x="742" y="335" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>oprd 1</text>
              <text x="742" y="445" textAnchor="start" fontSize="12" className={textClass} style={textStyle}>oprd 2</text>
              <text x="782" y="455" textAnchor="middle" fontSize="12" className={textClass} style={textStyle}>ALU control</text>
              
              <text x="822" y="365" textAnchor="end" fontSize="12" className={textClass} style={textStyle}>zero</text>
              <text x="822" y="415" textAnchor="end" fontSize="12" className={textClass} style={textStyle}>ALU result</text>

              {/* Main Title slightly smaller */}
              <text x="770" y="394" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>ALU</text>
            </>
          ) : (
            <text x="770" y="394" textAnchor="middle" fontSize="24" className={textClass} style={textStyle}>ALU</text>
          )}
        </g>
  );
}