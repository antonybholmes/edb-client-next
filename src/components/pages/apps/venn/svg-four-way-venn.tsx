import { DEG_TO_RAD } from '@/lib/math/math'
import { useContext } from 'react'
import { IVennProps } from './svg-three-way-venn'
import { VennContext } from './venn-provider'
import { useVenn } from './venn-store'

export function SVGFourWayVenn({
  labels = [],

  vennElemMap,
  combinationNames,

  overlapLabels = {},
}: IVennProps) {
  const { setItems } = useContext(VennContext)
  const { settings, circles } = useVenn()

  function _setItems(name: string, items: string[]) {
    const n = items.length
    const title = `There ${n === 0 || n > 1 ? 'are' : 'is'} ${n} selected item${n !== 1 ? 's' : ''} in ${name}:`

    setItems(title, items)
  }

  const center = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 0.75
  const labelRadius = settings.radius * 1.2
  const radius3 = settings.radius * 1.05

  const offset2 = [
    Math.cos(30 * DEG_TO_RAD) * radius2,
    Math.sin(30 * DEG_TO_RAD) * radius2,
  ]

  const offset3 = [
    Math.cos(30 * DEG_TO_RAD) * radius3,
    Math.sin(30 * DEG_TO_RAD) * radius3,
  ]

  const cA = [center[0] - offset2[0], center[1] - offset2[1]]
  const cB = [center[0] + offset2[0], center[1] - offset2[1]]
  const cC = [center[0], center[1] + radius2]

  const lA = [center[0] - offset3[0], center[1] - offset3[1]]
  const lB = [center[0] + offset3[0], center[1] - offset3[1]]
  const lC = [center[0], center[1] + radius3]

  return (
    <>
      {/* Circle A */}
      <circle
        cx={cA[0]}
        cy={cA[1]}
        r={settings.radius}
        fill={circles[0].fill}
        fillOpacity={circles[0].fillOpacity}
        stroke={circles[0].stroke}
      />

      <text
        x={cA[0]}
        y={cA[1] - labelRadius}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[0]} ({(vennElemMap.get('0')?.size || 0).toLocaleString()})
      </text>

      <text
        x={labels.length > 1 ? lA[0] : cA[0]}
        y={labels.length > 1 ? lA[1] : cA[1]}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={circles[0].color}
        onClick={() => {
          _setItems(labels[0], Array.from(vennElemMap.get('0') || []))
        }}
        style={{ cursor: 'pointer' }}
      >
        {(vennElemMap.get('0')?.size || 0).toLocaleString()}
      </text>

      {labels.length > 1 && (
        <>
          {/* Circle B */}
          <circle
            cx={cB[0]}
            cy={cB[1]}
            r={settings.radius}
            fill={circles[1].fill}
            fillOpacity={circles[1].fillOpacity}
            stroke={circles[1].stroke}
          />

          <text
            x={cB[0]}
            y={cB[1] - labelRadius}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {labels[1]} ({vennElemMap.get('1')?.size || 0})
          </text>

          <text
            x={labels.length > 1 ? lB[0] : cB[0]}
            y={labels.length > 1 ? lB[1] : cB[1]}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={circles[1].color}
            onClick={() => {
              _setItems(labels[1], Array.from(vennElemMap.get('1') || []))
            }}
            style={{ cursor: 'pointer' }}
          >
            {vennElemMap.get('1')?.size || 0}
          </text>
        </>
      )}

      {labels.length > 2 && (
        <>
          {/* Circle C */}
          <circle
            cx={cC[0]}
            cy={cC[1]}
            r={settings.radius}
            fill={circles[2].fill}
            fillOpacity={circles[2].fillOpacity}
            stroke={circles[2].stroke}
          />

          <text
            x={cC[0]}
            y={cC[1] + labelRadius}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {labels[2]} ({vennElemMap.get('2')?.size || 0})
          </text>

          <text
            x={lC[0]}
            y={lC[1]}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={circles[2].color}
            onClick={() => {
              _setItems(labels[2], Array.from(vennElemMap.get('2') || []))
            }}
            style={{ cursor: 'pointer' }}
          >
            {vennElemMap.get('2')?.size || 0}
          </text>
        </>
      )}

      {labels.length > 1 && (
        <>
          <text
            x={(cA[0] + cB[0]) / 2}
            y={lA[1]}
            fontSize="16"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['0:1']?.color || 'white'}
            onClick={() => {
              _setItems(
                combinationNames.get('0:1') || '',
                Array.from(vennElemMap.get('0:1') || [])
              )
            }}
            style={{ cursor: 'pointer' }}
          >
            {vennElemMap.get('0:1')?.size || 0}
          </text>
        </>
      )}

      {labels.length > 2 && (
        <>
          <text
            x={(lA[0] + lC[0]) / 2}
            y={(lA[1] + lC[1]) / 2}
            fontSize="16"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['0:2']?.color || 'white'}
            onClick={() => {
              _setItems(
                combinationNames.get('0:2') || '',
                Array.from(vennElemMap.get('0:2') || [])
              )
            }}
            style={{ cursor: 'pointer' }}
          >
            {vennElemMap.get('0:2')?.size || 0}
          </text>
          <text
            x={(lB[0] + lC[0]) / 2}
            y={(lB[1] + lC[1]) / 2}
            fontSize="16"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['1:2']?.color || 'white'}
            onClick={() => {
              _setItems(
                combinationNames.get('1:2') || '',
                Array.from(vennElemMap.get('1:2') || [])
              )
            }}
            style={{ cursor: 'pointer' }}
          >
            {vennElemMap.get('1:2')?.size || 0}
          </text>
          <text
            x={cC[0]}
            y={center[1]}
            fontSize="16"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels['0:1:2']?.color || 'white'}
            onClick={() => {
              _setItems(
                combinationNames.get('0:1:2') || '',
                Array.from(vennElemMap.get('0:1:2') || [])
              )
            }}
            style={{ cursor: 'pointer' }}
          >
            {vennElemMap.get('0:1:2')?.size || 0}
          </text>
        </>
      )}
    </>
  )
}
