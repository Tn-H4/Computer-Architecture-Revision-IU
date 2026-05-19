export default function ALUControl({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('alu_control')}>
          <path d="M828.5 534.5C828.5 551.897 807.234 566 781 566C754.766 566 733.5 551.897 733.5 534.5C733.5 517.103 754.766 503 781 503C807.234 503 828.5 517.103 828.5 534.5Z" fill="#D9D9D9"/>
          <text x="781" y="530" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>ALU</text>
          <text x="781" y="550" textAnchor="middle" fontSize="16" className={textClass} style={textStyle}>Control</text>
        </g>
  );
}