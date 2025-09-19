import { DEG_TO_RAD, ILim } from '@/lib/math/math'
import { useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

interface ICountTextProps {
  id: string
  center: ILim
  overlapLabels: { [key: string]: { color: string; label: string } }
  setItems: (name: string, items: string[]) => void
}

export function CountText({
  id,
  center,
  overlapLabels,
  setItems,
}: ICountTextProps) {
  const { combinationNames, vennElemMap, originalNames } = useVenn()
  const { settings } = useVennSettings()
  const n = vennElemMap[id]?.length || 0
  const d = Object.keys(originalNames).length
  const p = (d > 0 ? (n / d) * 100 : 0).toFixed(1)

  return (
    <>
      <text
        x={center[0]}
        y={center[1]}
        fontSize={settings.fonts.counts.size}
        fontWeight={settings.fonts.counts.weight}
        fontFamily={settings.fonts.counts.family}
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

      {settings.showPercentages && (
        <text
          x={center[0]}
          y={center[1] + 16}
          fontSize={settings.fonts.percentages.size}
          fontWeight={settings.fonts.percentages.weight}
          fontFamily={settings.fonts.percentages.family}
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

interface ITitleTextProps {
  id: number
  textAnchor?: string
  center: ILim
}

export function TitleText({
  id,
  center,
  textAnchor = 'middle',
}: ITitleTextProps) {
  const { vennLists } = useVenn()
  const { settings } = useVennSettings()
  const vennList = vennLists[id - 1]
  return (
    <text
      x={center[0]}
      y={center[1]}
      fontSize={settings.fonts.title.size}
      fontWeight={settings.fonts.title.weight}
      fontFamily={settings.fonts.title.family}
      fill={settings.fonts.title.color}
      textAnchor={textAnchor}
      dominantBaseline="middle"
    >
      {vennList?.name || `List ${id}`}

      {settings.showCounts && (
        <tspan>
          {` (${(vennList?.uniqueItems.length || 0).toLocaleString()})`}
        </tspan>
      )}
    </text>
  )
}

export function makeTitle(name: string, items: string[]) {
  const n = items.length

  return `There ${n === 0 || n > 1 ? 'are' : 'is'} ${n} ${name.includes('AND') ? 'common' : 'unique'} item${n !== 1 ? 's' : ''} in ${name}:`
}

export interface IVennProps {
  overlapLabels?: { [key: string]: { color: string; label: string } }
}

export function SVGThreeWayVenn({ overlapLabels = {} }: IVennProps) {
  const { setSelectedItems } = useVenn()
  const { settings, circles } = useVennSettings()

  function _setItems(name: string, items: string[]) {
    setSelectedItems(makeTitle(name, items), items)
  }

  const center = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 0.75
  const labelRadius = settings.radius * 1.15
  const radius3 = settings.radius * 1.05

  const offset2: ILim = [
    Math.cos(30 * DEG_TO_RAD) * radius2,
    Math.sin(30 * DEG_TO_RAD) * radius2,
  ]

  const offset3: ILim = [
    Math.cos(30 * DEG_TO_RAD) * radius3,
    Math.sin(30 * DEG_TO_RAD) * radius3,
  ]

  const cA: ILim = [center[0] - offset2[0], center[1] - offset2[1]]
  const cB: ILim = [center[0] + offset2[0], center[1] - offset2[1]]
  const cC: ILim = [center[0], center[1] + radius2]

  const lA: ILim = [center[0] - offset3[0], center[1] - offset3[1]]
  const lB: ILim = [center[0] + offset3[0], center[1] - offset3[1]]
  const lC: ILim = [center[0], center[1] + radius3]

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

      {settings.showTitles && (
        <TitleText
          id={1}
          center={[cA[0] - labelRadius * 0.1, cA[1] - labelRadius]}
        />
      )}

      <CountText
        id={'1'}
        center={lA}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* Circle B */}
      <circle
        cx={cB[0]}
        cy={cB[1]}
        r={settings.radius}
        fill={circles[2].fill}
        fillOpacity={circles[2].fillOpacity}
        stroke={circles[2].stroke}
      />

      {settings.showTitles && (
        <TitleText
          id={2}
          center={[cB[0] + labelRadius * 0.1, cB[1] - labelRadius]}
        />
      )}

      <CountText
        id={'2'}
        center={lB}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* Circle C */}
      <circle
        cx={cC[0]}
        cy={cC[1]}
        r={settings.radius}
        fill={circles[3].fill}
        fillOpacity={circles[3].fillOpacity}
        stroke={circles[3].stroke}
      />

      {settings.showTitles && (
        <TitleText id={3} center={[cC[0], cC[1] + labelRadius]} />
      )}

      <CountText
        id={'3'}
        center={lC}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2'}
        center={[(cA[0] + cB[0]) / 2, lA[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

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
  )
}
