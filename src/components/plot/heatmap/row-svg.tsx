import { useHeatmapContext } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-provider'
import type { LeftRightPos } from '@/components/side'
import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS } from '@/interfaces/pos'
import { IClusterFrame } from '@/lib/math/hcluster'
import { range } from 'd3'
import { ReactElement } from 'react'
import { SvgG } from '../svg-g'
import { SvgText } from '../svg-text'
import type { IColLabelsSvgProps, ITreeSvgProps } from './col-svg'

export function RowTreeSvg({
  tree,
  width,
  height,
  gaps,
  mode,
  props,
  pos = { ...ZERO_POS },
}: ITreeSvgProps & { mode: LeftRightPos }) {
  const gElems: ReactElement[] = []

  const points = range(4)

  for (let [ri, branch] of tree.coords.entries()) {
    const p = points.map((i) => {
      const y = branch.coords[i]!.x * width

      return {
        y: y + gaps.offset(y),
        x:
          mode === 'left'
            ? height - branch.coords[i]!.y * height
            : branch.coords[i]!.y * height,
      }
    })

    gElems.push(
      <path
        key={ri}
        d={`M ${p[0]!.x},${p[0]!.y} L ${p[1]!.x},${p[1]!.y} L ${p[2]!.x},${p[2]!.y} L ${p[3]!.x},${p[3]!.y}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={props.tree.row.stroke.value}
        strokeWidth={props.tree.row.stroke.width}
      />
    )
  }

  return (
    <SvgG pos={pos} shapeRendering={SVG_CRISP_EDGES}>
      {gElems}
    </SvgG>
  )
}

export function RowLabelsSvg({
  leaves,
  gaps,
  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const { plot } = useHeatmapContext()
  const props = plot.props

  const df = (plot.dataframes['main'] as IClusterFrame).df

  const blockSize = props.blockSize
  const offset = blockSize.h / 2
  const rowMetaN = range(
    0,
    props.labels.row.showMetadata ? df.rowObs.shape[1] : 1
  )
  const isLeft = props.labels.row.position === 'left'

  const gElems: ReactElement[] = []

  for (const [ri, row] of leaves.entries()) {
    const y = gaps.position(ri) + offset
    gElems.push(
      <SvgText
        key={ri}
        id={`row-label-${ri}`}
        x={0}
        y={y}
        font={props.labels.row}
        dominantBaseline="central"
        textAnchor={isLeft ? 'end' : 'start'}
      >
        {rowMetaN.map((rmi) => df.rowObs.str(row, rmi)).join(', ')}
      </SvgText>
    )

    // x += blockSize.w
  }

  return <SvgG pos={pos}>{gElems}</SvgG>
}
