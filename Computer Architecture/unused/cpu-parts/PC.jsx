export default function PC({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('pc')}>
          <rect x="41" y="311" width="39" height="85" fill="#D9D9D9"/>
          <text x="60" y="360" textAnchor="middle" fontSize="20" className={textClass} style={textStyle}>PC</text>
        </g>
  );
}