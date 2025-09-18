import { DEG_TO_RAD } from '@/lib/math/math'
import { CountText } from './svg-three-way-venn'
import { useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

export interface IVennProps {
  labels?: string[]
  vennElemMap: Map<string, Set<string>>

  overlapLabels?: { [key: string]: { color: string; label: string } }
}

export function SVGFourWayVenn({
  labels = [],

  vennElemMap,

  overlapLabels = {},
}: IVennProps) {
  const { setSelectedItems, combinationNames } = useVenn()
  const { settings, circles } = useVennSettings()

  function _setItems(name: string, items: string[]) {
    const n = items.length
    const title = `There ${n === 0 || n > 1 ? 'are' : 'is'} ${n} ${name.includes('AND') ? 'common' : 'unique'} item${n !== 1 ? 's' : ''} in ${name}:`

    setSelectedItems(title, items)
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
      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={settings.radius * 0.5}
        ry={settings.radius}
        fill={circles[1].fill}
        fillOpacity={circles[1].fillOpacity}
        stroke={circles[1].stroke}
        transform={`translate(${-settings.radius / 2}, ${settings.radius / 4}) rotate(-45, ${center[0]}, ${center[1]}) `}
      />

      <text
        x={center[0] - settings.radius}
        y={center[1] + settings.radius}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[0]} ({(vennElemMap.get('1')?.size || 0).toLocaleString()})
      </text>

      {/* Circle B */}

      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={settings.radius * 0.5}
        ry={settings.radius}
        fill={circles[2].fill}
        fillOpacity={circles[2].fillOpacity}
        stroke={circles[2].stroke}
        transform={`rotate(-45, ${center[0]}, ${center[1]})`}
      />

      <text
        x={center[0] - settings.radius / 2}
        y={center[1] - settings.radius}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[1]} ({vennElemMap.get('2')?.size || 0})
      </text>

      {/* Circle C */}
      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={settings.radius * 0.5}
        ry={settings.radius}
        fill={circles[3].fill}
        fillOpacity={circles[3].fillOpacity}
        stroke={circles[3].stroke}
        transform={`rotate(45, ${center[0]}, ${center[1]})`}
      />

      <text
        x={center[0] + settings.radius / 2}
        y={center[1] - settings.radius}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[2]} ({vennElemMap.get('3')?.size || 0})
      </text>

      {/* Circle 4 */}

      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={settings.radius * 0.5}
        ry={settings.radius}
        fill={circles[4].fill}
        fillOpacity={circles[4].fillOpacity}
        stroke={circles[4].stroke}
        transform={`translate(${settings.radius * 0.5}, ${settings.radius * 0.25}) rotate(45, ${center[0]}, ${center[1]}) `}
      />

      <text
        x={center[0] + settings.radius}
        y={center[1] + settings.radius}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[3]} ({vennElemMap.get('3')?.size || 0})
      </text>

      {/* Lists */}

      <CountText
        id={'1'}
        center={[center[0] - settings.radius * 0.9, center[1]]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2'}
        center={[
          center[0] - settings.radius * 0.4,
          center[1] - settings.radius * 0.55,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'3'}
        center={[
          center[0] + settings.radius * 0.4,
          center[1] - settings.radius * 0.55,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'4'}
        center={[center[0] + settings.radius * 0.9, center[1]]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2'}
        center={[
          center[0] - settings.radius * 0.6,
          center[1] - settings.radius * 0.3,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:3'}
        center={[center[0], center[1] - settings.radius * 0.3]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'3:4'}
        center={[
          center[0] + settings.radius * 0.6,
          center[1] - settings.radius * 0.3,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:3'}
        center={[
          center[0] - settings.radius * 0.5,
          center[1] + settings.radius * 0.5,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:4'}
        center={[
          center[0] + settings.radius * 0.5,
          center[1] + settings.radius * 0.5,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:4'}
        center={[center[0], center[1] + settings.radius * 0.85]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2:3'}
        center={[
          center[0] - settings.radius * 0.3,
          center[1] + settings.radius * 0.1,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:3:4'}
        center={[
          center[0] + settings.radius * 0.3,
          center[1] + settings.radius * 0.1,
        ]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2:3:4'}
        center={[center[0], center[1] + settings.radius * 0.4]}
        vennElemMap={vennElemMap}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* <text
        x={center[0]}
        y={center[1] + settings.radius * 0.4}
        fontSize="16"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={overlapLabels['1:2:3']?.color || 'white'}
        onClick={() => {
          _setItems(
            combinationNames['1:2:3'] || '',
            Array.from(vennElemMap.get('1:2:3') || [])
          )
        }}
        style={{ cursor: 'pointer' }}
      >
        {vennElemMap.get('1:2:3:4')?.size || 0}
      </text> */}
    </>
  )
}
