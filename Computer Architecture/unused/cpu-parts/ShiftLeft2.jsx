export default function ShiftLeft2({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('shift_left')}>
          <ellipse cx="684" cy="92" rx="24" ry="51" fill="#D9D9D9"/>
          <text x="684" y="80" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>Shift</text>
          <text x="684" y="98" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>left</text>
          <text x="684" y="116" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>2</text>
        </g>
  );
}