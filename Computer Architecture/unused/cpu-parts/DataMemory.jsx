export default function DataMemo({ getGroupProps, getTextStyle, textClass, textStyle, hoveredComponent }) {
  return (
        <g {...getGroupProps('data_memory')}>
          <rect x="909" y="364" width="112" height="116" fill="#D9D9D9"/>
          {hoveredComponent === 'data_memory' ? (
            <>
              <rect x="909" y="364" width="112" height="116" fill="transparent" stroke="#38bdf8" strokeWidth="4"/>
              <text x="914" y="385" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Address</text>
              <text x="914" y="435" textAnchor="start" fontSize="14" className={textClass} style={textStyle}>Write data</text>
              <text x="1016" y="385" textAnchor="end" fontSize="14" className={textClass} style={textStyle}>Read data</text>
              <text x="965" y="472" textAnchor="middle" fontSize="14" className={textClass} style={textStyle}>Data Memory</text>
            </>
          ) : (
            <>
              <text x="965" y="416" textAnchor="middle" fontSize="22" className={textClass} style={textStyle}>Data</text>
              <text x="965" y="442" textAnchor="middle" fontSize="22" className={textClass} style={textStyle}>memory</text>
            </>
          )}
        </g>
  );
}