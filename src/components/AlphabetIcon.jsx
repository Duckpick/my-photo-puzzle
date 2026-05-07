export function AlphabetIcon({
    value,
    color = "#111",
    size = 128,
  }) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128">
<rect width="128" height="128" fill="transparent" />
  
        <text
          x="50%"
          y="54%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="80"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          fill={color}
          stroke="#000"
          strokeWidth="4"
          paintOrder="stroke"
        >
          {value}
        </text>
      </svg>
    )
  }