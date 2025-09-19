import { DEG_TO_RAD } from '@/lib/math/math'
import { useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

interface ICountTextProps {
  id: string

  center: [number, number]
  overlapLabels: { [key: string]: { color: string; label: string } }
  setItems: (name: string, items: string[]) => void
  showPercent?: boolean
}

export function CountText({
  id,

  center,
  overlapLabels,
  setItems,
  showPercent = true,
}: ICountTextProps) {
  const { combinationNames, vennElemMap, originalNames } = useVenn()
  const n = vennElemMap[id]?.length || 0
  const p = ((n / Object.keys(originalNames).length) * 100).toFixed(1)
  return (
    <>
      <text
        x={center[0]}
        y={center[1]}
        fontSize="16"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={overlapLabels[id]?.color || 'white'}
        onClick={() => {
          setItems(
            combinationNames[id] || '',
            Array.from(vennElemMap[id] || [])
          )
        }}
        style={{ cursor: 'pointer' }}
      >
        {n.toLocaleString()}
      </text>

      {showPercent && (
        <text
          x={center[0]}
          y={center[1] + 16}
          fontSize="12"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={overlapLabels[id]?.color || 'white'}
          onClick={() => {
            setItems(
              combinationNames[id] || '',
              Array.from(vennElemMap[id] || [])
            )
          }}
          style={{ cursor: 'pointer' }}
        >
          {p}%
        </text>
      )}
    </>
  )
}

export function makeTitle(name: string, items: string[]) {
  const n = items.length

  return `There ${n === 0 || n > 1 ? 'are' : 'is'} ${n} ${name.includes('AND') ? 'common' : 'unique'} item${n !== 1 ? 's' : ''} in ${name}:`
}

export interface IVennProps {
  labels?: string[]

  overlapLabels?: { [key: string]: { color: string; label: string } }
}

export function SVGThreeWayVenn({
  labels = [],

  overlapLabels = {},
}: IVennProps) {
  const { setSelectedItems, vennElemMap } = useVenn()
  const { settings, circles } = useVennSettings()

  function _setItems(name: string, items: string[]) {
    setSelectedItems(makeTitle(name, items), items)
  }

  const center = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 0.75
  const labelRadius = settings.radius * 1.15
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
        fill={circles[1].fill}
        fillOpacity={circles[1].fillOpacity}
        stroke={circles[1].stroke}
      />

      <text
        x={cA[0] - labelRadius * 0.1}
        y={cA[1] - labelRadius}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[0]} ({(vennElemMap['1']?.length || 0).toLocaleString()})
      </text>

      <CountText
        id={'1'}
        center={[
          labels.length > 1 ? lA[0] : cA[0],
          labels.length > 1 ? lA[1] : cA[1],
        ]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {labels.length > 1 && (
        <>
          {/* Circle B */}
          <circle
            cx={cB[0]}
            cy={cB[1]}
            r={settings.radius}
            fill={circles[2].fill}
            fillOpacity={circles[2].fillOpacity}
            stroke={circles[2].stroke}
          />

          <text
            x={cB[0] + labelRadius * 0.1}
            y={cB[1] - labelRadius}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {labels[1]} ({(vennElemMap['2']?.length || 0).toLocaleString()})
          </text>

          <CountText
            id={'2'}
            center={[
              labels.length > 1 ? lB[0] : cB[0],
              labels.length > 1 ? lB[1] : cB[1],
            ]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />
        </>
      )}

      {labels.length > 2 && (
        <>
          {/* Circle C */}
          <circle
            cx={cC[0]}
            cy={cC[1]}
            r={settings.radius}
            fill={circles[3].fill}
            fillOpacity={circles[3].fillOpacity}
            stroke={circles[3].stroke}
          />

          <text
            x={cC[0]}
            y={cC[1] + labelRadius}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {labels[2]} ({(vennElemMap['3']?.length || 0).toLocaleString()})
          </text>

          <CountText
            id={'3'}
            center={lC as [number, number]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />
        </>
      )}

      {labels.length > 1 && (
        <CountText
          id={'1:2'}
          center={[(cA[0] + cB[0]) / 2, lA[1]]}
          overlapLabels={overlapLabels}
          setItems={_setItems}
        />
      )}

      {labels.length > 2 && (
        <>
          <CountText
            id={'1:3'}
            center={[(lA[0] + lC[0]) / 2, (lA[1] + lC[1]) / 2]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />

          <CountText
            id={'2:3'}
            center={[(lB[0] + lC[0]) / 2, (lB[1] + lC[1]) / 2]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />

          <CountText
            id={'1:2:3'}
            center={[cC[0], center[1]]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />
        </>
      )}
    </>
  )
}
