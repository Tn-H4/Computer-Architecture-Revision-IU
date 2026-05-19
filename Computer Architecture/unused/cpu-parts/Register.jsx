export default function Registers({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
    <g {...getGroupProps('registers')}>
      <rect x="410" y="311" width="168" height="169" fill="#D9D9D9"/>

      {hoveredComponent === 'registers' ? (
        <>
          <rect x="410" y="311" width="168" height="169" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
          <text x="415" y="335" textAnchor="start" fontSize="14" className={textClass} style={getTextStyle('registers')}>Read register 1</text>
          <text x="415" y="365" textAnchor="start" fontSize="14" className={textClass} style={getTextStyle('registers')}>Read register 2</text>
          <text x="415" y="410" textAnchor="start" fontSize="14" className={textClass} style={getTextStyle('registers')}>Write register</text>
          <text x="415" y="440" textAnchor="start" fontSize="14" className={textClass} style={getTextStyle('registers')}>Write data</text>
          <text x="573" y="345" textAnchor="end" fontSize="14" className={textClass} style={getTextStyle('registers')}>Read data 1</text>
          <text x="573" y="425" textAnchor="end" fontSize="14" className={textClass} style={getTextStyle('registers')}>Read data 2</text>
          <text x="494" y="470" textAnchor="middle" fontSize="16" className={textClass} style={getTextStyle('registers')}>Registers</text>
        </>
      ) : (
        <text x="494" y="402" textAnchor="middle" fontSize="24" className={textClass} style={getTextStyle('registers')}>Registers</text>
      )}
    </g>
  );
}