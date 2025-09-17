import { DEG_TO_RAD } from '@/lib/math/math'
import { DEFAULT_CIRCLES, IVennCircleProps } from '@/stores/venn-circle-store'

interface IProps {
  radius?: number

  labels?: IVennCircleProps[]
  vennElemMap: Map<string, Set<string>>
  width?: number
  height?: number
  overlapLabels: { [key: string]: { color: string; label: string } }
}

export function SVGThreeWayVenn({
  radius = 160,
  labels = DEFAULT_CIRCLES,

  vennElemMap,
  width = 400,
  height = 400,
  overlapLabels = {},
}: IProps) {
  const center = [width * 0.3, height * 0.25]
  const radius2 = radius * 0.75

  const offset = [
    Math.cos(30 * DEG_TO_RAD) * radius2,
    Math.sin(30 * DEG_TO_RAD) * radius2,
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
        fill={labels[0].fill}
        fillOpacity={labels[0].fillOpacity}
        stroke={labels[0].stroke}
      />

      <text
        x={cxA - radius2 / 4}
        y={cyA}
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labels[0].color}
      >
        {labels[0].name} ({(vennElemMap.get('0')?.size || 0).toLocaleString()})
      </text>

      {/* Circle B */}
      <circle
        cx={cxB}
        cy={cyB}
        r={radius}
        fill={labels[1].fill}
        fillOpacity={labels[1].fillOpacity}
        stroke={labels[1].stroke}
      />
      <text
        x={cxB + radius2 / 4}
        y={cyB}
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labels[1].color}
      >
        {labels[1].name} ({vennElemMap.get('1')?.size || 0})
      </text>

      {labels.length > 2 && (
        <>
          {/* Circle C */}
          <circle
            cx={cxC}
            cy={cyC}
            r={radius}
            fill={labels[2]?.fill}
            fillOpacity={labels[2]?.fillOpacity}
            stroke={labels[2]?.stroke}
          />

          <text
            x={cxC}
            y={cyC + radius2 / 4}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={labels[2]?.color}
          >
            {labels[2]?.name} ({vennElemMap.get('2')?.size || 0})
          </text>
        </>
      )}

      {/* Overlap region labels */}
      <text
        x={(cxA + cxB) / 2}
        y={cyA - radius2 / 5}
        fontSize="14"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={overlapLabels['0:1']?.color || 'white'}
      >
        A ∩ B ({vennElemMap.get('0:1')?.size || 0})
      </text>

      {labels.length > 2 && (
        <>
          <text
            x={(cxA + cxC) / 2 - radius2 / 4}
            y={(cyA + cyC) / 2 + radius2 / 6}
            fontSize="14"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['0:2']?.color || 'white'}
          >
            A ∩ C ({vennElemMap.get('0:2')?.size || 0})
          </text>
          <text
            x={(cxB + cxC) / 2 + radius2 / 5}
            y={(cyB + cyC) / 2 + radius2 / 6}
            fontSize="14"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['1:2']?.color || 'white'}
          >
            B ∩ C ({vennElemMap.get('1:2')?.size || 0})
          </text>
          <text
            x={cxC}
            y={center[1]}
            fontSize="14"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['0:1:2']?.color || 'white'}
          >
            A ∩ B ∩ C ({vennElemMap.get('0:1:2')?.size || 0})
          </text>
        </>
      )}
    </>
  )
}
