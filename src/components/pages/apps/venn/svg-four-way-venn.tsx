import { CountText, makeTitle } from './svg-three-way-venn'
import { useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

export interface IVennProps {
  labels?: string[]

  overlapLabels?: { [key: string]: { color: string; label: string } }
}

export function SVGFourWayVenn({
  labels = [],

  overlapLabels = {},
}: IVennProps) {
  const { setSelectedItems, vennElemMap } = useVenn()
  const { settings, circles } = useVennSettings()

  function _setItems(name: string, items: string[]) {
    setSelectedItems(makeTitle(name, items), items)
  }

  const center = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 1.2

  return (
    <>
      {/* Circle A */}
      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={radius2 * 0.5}
        ry={radius2}
        fill={circles[1].fill}
        fillOpacity={circles[1].fillOpacity}
        stroke={circles[1].stroke}
        transform={`translate(${-radius2 / 2}, ${radius2 / 4}) rotate(-45, ${center[0]}, ${center[1]}) `}
      />

      <text
        x={center[0] - radius2 * 0.9}
        y={center[1] + radius2 * 0.8}
        fontSize="16"
        fontWeight="bold"
        textAnchor="end"
        dominantBaseline="middle"
      >
        {labels[0]} ({(vennElemMap['1']?.length || 0).toLocaleString()})
      </text>

      {/* Circle B */}

      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={radius2 * 0.5}
        ry={radius2}
        fill={circles[2].fill}
        fillOpacity={circles[2].fillOpacity}
        stroke={circles[2].stroke}
        transform={`rotate(-45, ${center[0]}, ${center[1]})`}
      />

      <text
        x={center[0] - radius2 / 2}
        y={center[1] - radius2}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[1]} ({vennElemMap['2']?.length || 0})
      </text>

      {/* Circle C */}
      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={radius2 * 0.5}
        ry={radius2}
        fill={circles[3].fill}
        fillOpacity={circles[3].fillOpacity}
        stroke={circles[3].stroke}
        transform={`rotate(45, ${center[0]}, ${center[1]})`}
      />

      <text
        x={center[0] + radius2 / 2}
        y={center[1] - radius2}
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {labels[2]} ({vennElemMap['3']?.length || 0})
      </text>

      {/* Circle 4 */}

      <ellipse
        cx={center[0]}
        cy={center[1]}
        rx={radius2 * 0.5}
        ry={radius2}
        fill={circles[4].fill}
        fillOpacity={circles[4].fillOpacity}
        stroke={circles[4].stroke}
        transform={`translate(${radius2 * 0.5}, ${radius2 * 0.25}) rotate(45, ${center[0]}, ${center[1]}) `}
      />

      <text
        x={center[0] + radius2 * 0.9}
        y={center[1] + radius2 * 0.8}
        fontSize="16"
        fontWeight="bold"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {labels[3]} ({vennElemMap['3']?.length || 0})
      </text>

      {/* Lists */}

      <CountText
        id={'1'}
        center={[center[0] - radius2 * 0.96, center[1] - radius2 * 0.06]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2'}
        center={[center[0] - radius2 * 0.42, center[1] - radius2 * 0.6]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'3'}
        center={[center[0] + radius2 * 0.42, center[1] - radius2 * 0.6]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'4'}
        center={[center[0] + radius2 * 0.96, center[1] - radius2 * 0.06]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2'}
        center={[center[0] - radius2 * 0.62, center[1] - radius2 * 0.32]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:3'}
        center={[center[0], center[1] - radius2 * 0.32]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'3:4'}
        center={[center[0] + radius2 * 0.62, center[1] - radius2 * 0.32]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:3'}
        center={[center[0] - radius2 * 0.52, center[1] + radius2 * 0.48]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:4'}
        center={[center[0] + radius2 * 0.52, center[1] + radius2 * 0.48]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:4'}
        center={[center[0], center[1] + radius2 * 0.82]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2:3'}
        center={[center[0] - radius2 * 0.32, center[1] + radius2 * 0.05]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:3:4'}
        center={[center[0] + radius2 * 0.32, center[1] + radius2 * 0.05]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2:3:4'}
        center={[center[0], center[1] + radius2 * 0.4]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* <text
        x={center[0]}
        y={center[1] + radius2 * 0.4}
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
