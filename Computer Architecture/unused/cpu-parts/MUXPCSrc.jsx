export default function MUXPCSrc({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('mux_pcsrc')}>
          <rect x="842" y="9" width="30" height="70" rx="15" fill="#D9D9D9"/>
          <text x="857" y="48" textAnchor="middle" fontSize="14" transform="rotate(-90 857 48)" className={textClass} style={textStyle}>MUX</text>
        </g>
  );
}