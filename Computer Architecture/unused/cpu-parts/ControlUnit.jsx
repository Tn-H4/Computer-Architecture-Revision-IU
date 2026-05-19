export default function ControlUnit({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('control_unit')}>
          <ellipse cx="409.5" cy="197.5" rx="49.5" ry="99.5" fill="#D9D9D9"/>
          <text x="409" y="193" textAnchor="middle" fontSize="20" className={textClass} style={textStyle}>Control</text>
          <text x="409" y="217" textAnchor="middle" fontSize="20" className={textClass} style={textStyle}>Unit</text>
        </g>
  );
}