export default function MUXRegDst({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('mux_regdst')}>
          <rect x="360" y="372" width="30" height="70" rx="15" fill="#D9D9D9"/>
          <text x="375" y="411" textAnchor="middle" fontSize="14" transform="rotate(-90 375 411)" className={textClass} style={textStyle}>MUX</text>
        </g>
  );
}