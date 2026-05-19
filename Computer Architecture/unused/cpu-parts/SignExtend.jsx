export default function SignExtend({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('sign_extend')}>
          <ellipse cx="450" cy="541" rx="40" ry="47" fill="#D9D9D9"/>
          <text x="450" y="537" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Sign</text>
          <text x="450" y="557" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>extend</text>
        </g>
  );
}