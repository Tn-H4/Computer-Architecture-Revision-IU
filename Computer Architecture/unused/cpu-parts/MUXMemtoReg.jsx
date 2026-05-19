export default function MUXMemtoReg({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('mux_memtoreg')}>
          <rect x="1058" y="379" width="30" height="70" rx="15" fill="#D9D9D9"/>
          <text x="1073" y="418" textAnchor="middle" fontSize="14" transform="rotate(-90 1073 418)" className={textClass} style={textStyle}>MUX</text>
        </g>
  );
}