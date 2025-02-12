import { COLOR_BLACK, SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS, type IPos } from '@interfaces/pos'
import { Axis } from './axis'

interface IAxisProps {
  ax: Axis
  pos?: IPos
  showTicks?: boolean
  showTickLabels?: boolean
  tickSize?: number
  strokeWidth?: number
  title?: string
  titleOffset?: number
  color?: string
  fontSize?: string
}

export function AxisLeftSvg({
  ax,
  showTicks = true,
  showTickLabels = true,
  tickSize = 5,
  strokeWidth = 2,
  color = COLOR_BLACK,
  pos = { ...ZERO_POS },
  title,
  titleOffset,
  fontSize = 'small',
}: IAxisProps) {
  const _title = title ?? ax.title
  //use tick labels to guess an appropriate offset
  const _titleOffset =
    titleOffset ??
    2 * tickSize + 12 * Math.max(...ax.tickLabels.map(l => l.length))

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <line
        y1={-0.5 * strokeWidth}
        y2={ax.range[1] + 0.5 * strokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {_title && (
        <text
          transform={`translate(-${_titleOffset}, ${
            0.5 * ax.range.reduce((x, y) => x + y, 0)
          }) rotate(270)  `}
          textAnchor="middle"
          fontSize={fontSize}
        >
          {_title}
        </text>
      )}

      {showTicks && (
        <g>
          <g>
            {ax.ticks.map((tick, ticki) => {
              return (
                <line
                  x2={tickSize}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  transform={`translate(-${tickSize}, ${ax.domainToRange(tick)})`}
                  key={ticki}
                />
              )
            })}
          </g>

          {showTickLabels && (
            <g transform={`translate(-${tickSize * 2}, 0)`}>
              {ax.ticks.map((tick, ticki) => {
                //console.log(ax, tick, ax.tickLabels[ticki], ax.domainToRange(tick))
                return (
                  <text
                    key={ticki}
                    x={0}
                    y={ax.domainToRange(tick)}
                    fill={color}
                    dominantBaseline="central"
                    textAnchor="end"
                    fontSize={fontSize}
                  >
                    {ax.tickLabels[ticki]}
                  </text>
                )
              })}
            </g>
          )}
        </g>
      )}
    </g>
  )
}

export function AxisBottomSvg({
  ax,
  showTicks = true,
  showTickLabels = true,
  tickSize = 5,
  strokeWidth = 2,
  color = COLOR_BLACK,
  pos = { ...ZERO_POS },
  titleOffset,
  title,
  fontSize = 'small',
}: IAxisProps) {
  const _titleOffset = titleOffset ?? tickSize * 10

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <line
        x2={ax.range[1] + 0.5 * strokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {title && (
        <text
          transform={`translate(${
            0.5 * ax.range.reduce((x, y) => x + y, 0)
          }, ${_titleOffset})`}
          textAnchor="middle"
          fontSize={fontSize}
        >
          {title}
        </text>
      )}

      {showTicks && (
        <g>
          <g>
            {ax.ticks.map((tick, ticki) => {
              return (
                <line
                  y2={tickSize}
                  stroke={color}
                  transform={`translate(${ax.domainToRange(tick)}, 0)`}
                  key={ticki}
                  strokeWidth={strokeWidth}
                />
              )
            })}
          </g>

          {showTickLabels && (
            <g transform={`translate(0, ${tickSize * 2})`}>
              {ax.ticks.map((tick, ticki) => (
                <text
                  key={ticki}
                  x={ax.domainToRange(tick)}
                  fill={color}
                  dominantBaseline="hanging"
                  textAnchor="middle"
                  fontSize={fontSize}
                >
                  {ax.tickLabels[ticki]}
                </text>
              ))}
            </g>
          )}
        </g>
      )}
    </g>
  )
}

export function AxisTopSvg({
  ax,
  tickSize = 5,
  strokeWidth = 2,
  color = COLOR_BLACK,
  pos = { ...ZERO_POS },
  title,
  titleOffset,
}: IAxisProps) {
  const _title = title ?? ax.title
  const _titleOffset = titleOffset ?? tickSize * 8

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <line
        x2={ax.range[1] + 0.5 * strokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {_title && (
        <text
          transform={`translate(${
            0.5 * ax.range.reduce((x, y) => x + y, 0)
          }, ${-_titleOffset})`}
          textAnchor="middle"
        >
          {_title}
        </text>
      )}

      <g>
        {ax.ticks.map((tick, ticki) => {
          return (
            <line
              y1={-tickSize}
              y2={0.5 * strokeWidth}
              stroke={color}
              transform={`translate(${ax.domainToRange(tick)}, 0)`}
              key={ticki}
              strokeWidth={strokeWidth}
            />
          )
        })}
      </g>

      <g transform={`translate(0, -${tickSize * 4})`}>
        {ax.ticks.map((tick, ticki) => (
          <text
            key={ticki}
            x={ax.domainToRange(tick)}
            fill={color}
            dominantBaseline="hanging"
            textAnchor="middle"
            fontSize="smaller"
          >
            {ax.tickLabels[ticki]}
          </text>
        ))}
      </g>
    </g>
  )
}
