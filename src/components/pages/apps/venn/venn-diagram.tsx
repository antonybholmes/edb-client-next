interface IProps {
  radius?: number
  colors?: [string, string, string]
  labels?: [string, string, string]
  vennElemMap: Map<string, Set<string>>
  width?: number
  height?: number
}

export function SvgVennDiagram({
  radius = 160,
  colors = ['#f87171', '#60a5fa', '#34d399'],
  labels = ['A', 'B', 'C'],
  vennElemMap,
  width = 400,
  height = 400,
}: IProps) {
  const center = [width / 2, height / 2]
  const radius2 = radius * 0.75

  const offset = [
    Math.cos((30 * Math.PI) / 180) * radius2,
    Math.sin((30 * Math.PI) / 180) * radius2,
  ]

  const cxA = center[0] - offset[0]
  const cyA = center[1] - offset[1]

  const cxB = center[0] + offset[0]
  const cyB = center[1] - offset[1]

  const cxC = center[0]
  const cyC = center[1] + radius2

  return (
    <>
      {/* Circle A */}
      <circle
        cx={cxA}
        cy={cyA}
        r={radius}
        fill={colors[0]}
        fillOpacity={0.5}
        stroke="black"
      />
      {/* Circle B */}
      <circle
        cx={cxB}
        cy={cyB}
        r={radius}
        fill={colors[1]}
        fillOpacity={0.5}
        stroke="black"
      />
      {/* Circle C */}
      <circle
        cx={cxC}
        cy={cyC}
        r={radius}
        fill={colors[2]}
        fillOpacity={0.5}
        stroke="black"
      />

      {/* Circle Labels */}
      <text
        x={cxA - radius2 / 3}
        y={cyA}
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[0]} ({(vennElemMap.get('0')?.size || 0).toLocaleString()})
      </text>
      <text
        x={cxB + radius2 / 3}
        y={cyB}
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[1]} ({vennElemMap.get('1')?.size || 0})
      </text>
      <text
        x={cxC}
        y={cyC + radius2 / 3}
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[2]} ({vennElemMap.get('2')?.size || 0})
      </text>

      {/* Overlap region labels */}
      <text
        x={(cxA + cxB) / 2}
        y={cyA - radius2 / 4}
        fontSize="12"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="black"
      >
        A ∩ B <tspan>{vennElemMap.get('0:1')?.size || 0}</tspan>
      </text>
      <text
        x={(cxA + cxC) / 2 - radius2 / 5}
        y={(cyA + cyC) / 2 + radius2 / 5}
        fontSize="12"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="black"
      >
        A ∩ C <tspan>{vennElemMap.get('0:2')?.size || 0}</tspan>
      </text>
      <text
        x={(cxB + cxC) / 2 + radius2 / 5}
        y={(cyB + cyC) / 2 + radius2 / 5}
        fontSize="12"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="black"
      >
        B ∩ C <tspan>{vennElemMap.get('1:2')?.size || 0}</tspan>
      </text>
      <text
        x={cxC}
        y={center[1]}
        fontSize="12"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="black"
      >
        A ∩ B ∩ C <tspan>{vennElemMap.get('0:1:2')?.size || 0}</tspan>
      </text>
    </>
  )
}
