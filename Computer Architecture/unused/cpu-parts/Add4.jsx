export default function Add4({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('adder_pc')}>
          <path d="M302 35L346 63.7537V119.908L302 149V109.76L321.556 91.8309L302 73.5638V35Z" fill="#D9D9D9"/>
          <text x="320" y="98" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Add</text>
        </g>
  );
}