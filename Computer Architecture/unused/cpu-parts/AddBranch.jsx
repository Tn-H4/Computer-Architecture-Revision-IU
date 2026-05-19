export default function AddBranch({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('adder_branch')}>
          <path d="M736 0L780 28.7537V84.908L736 114V74.7596L755.556 56.8309L736 38.5638V0Z" fill="#D9D9D9"/>
          <text x="754" y="63" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Add</text>
        </g>
  );
}