import { useHeatmapContext } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-provider'
import type { LeftRightPos } from '@/components/side'
import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS } from '@/interfaces/pos'
import { IClusterFrame } from '@/lib/math/hcluster'
import { range } from 'd3'
import { SvgText } from '../svg-text'
import type { IColLabelsSvgProps, ITreeSvgProps } from './col-svg'

export function RowTreeSvg({
  tree,
  width,
  height,
  mode,
  props,
  pos = { ...ZERO_POS },
}: ITreeSvgProps & { mode: LeftRightPos }) {
  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {tree.coords.map((coords, ri) => {
        const p = range(4).map((i) => ({
          y: coords[i]!.x * width,
          x:
            mode === 'left'
              ? height - coords[i]!.y * height
              : coords[i]!.y * height,
        }))

        return (
          <path
            key={ri}
            d={`M ${p[0]!.x},${p[0]!.y} L ${p[1]!.x},${p[1]!.y} L ${p[2]!.x},${p[2]!.y} L ${p[3]!.x},${p[3]!.y}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke={props.rowTree.stroke.value}
            strokeWidth={props.rowTree.stroke.width}
          />
        )
      })}
    </g>
  )
}

export function RowLabelsSvg({
  leaves,

  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const { plot } = useHeatmapContext()
  const props = plot.props

  const df = (plot.dataframes['main'] as IClusterFrame).df

  const blockSize = props.blockSize
  const halfH = blockSize.h / 2
  const rowMetaN = range(
    0,
    props.rowLabels.showMetadata ? df.rowObs.shape[1] : 1
  )
  const isLeft = props.rowLabels.position === 'left'

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {leaves.map((row, ri) => {
        return (
          <SvgText
            key={row}
            id={`row-label-${row}`}
            x={0}
            y={ri * blockSize.h + halfH}
            font={props.rowLabels}
            dominantBaseline="central"
            textAnchor={isLeft ? 'end' : 'start'}
          >
            {rowMetaN.map((rmi) => df.rowObs.str(row, rmi)).join(', ')}
          </SvgText>
        )
      })}
    </g>
  )
}
