export default function MUXALUSrc({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('mux_alusrc')}>
          <rect x="643" y="405" width="30" height="70" rx="15" fill="#D9D9D9"/>
          <text x="658" y="444" textAnchor="middle" fontSize="14" transform="rotate(-90 658 444)" className={textClass} style={textStyle}>MUX</text>
        </g>
  );
}