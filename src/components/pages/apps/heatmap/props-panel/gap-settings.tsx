import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/baseui/accordion'
import { Input } from '@/components/shadcn/ui/themed/baseui/input'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { produce } from 'immer'

import { PropRow } from '@/components/dialogs/prop-row'
import { NumSlider } from '@/components/shadcn/ui/themed/baseui/num-slider'
import { ITEM_REGEX } from '@/consts'
import { numSort } from '@/lib/math/math'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function GapSettingsPanel() {
  const { displayProps, plot, rowLeaves, colLeaves } = useHeatmapContext()
  const { updatePlot } = useHistory()

  const cf = plot.dataframes['main'] as IClusterFrame
  const df = cf.df

  const colNames = colLeaves.map((leaf) => df.colNames[leaf].toLowerCase())
  const rowNames = rowLeaves.map((leaf) => df.rowNames[leaf].toLowerCase())

  return (
    <AccordionItem value="gaps">
      <AccordionTrigger>Gaps</AccordionTrigger>
      <AccordionContent>
        <PropRow title="Rows">
          <NumSlider
            value={displayProps.gaps.rows.size}

            onNumChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.gaps.rows.size = v
                })
              )
            }}
          />
          <Input
            value={numSort([...new Set(displayProps.gaps.rows.indexes)]).join(
              '; '
            )}
            title="Provide row gaps as semicolon-separated values, e.g. 1; 2; 3"
            onTextChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.gaps.rows.indexes = findIndices(v, rowNames)
                })
              )
            }}
            w="sm"
            h="toolbar"
          />
        </PropRow>

        <PropRow title="Columns">
          <NumSlider
            value={displayProps.gaps.cols.size}

            onNumChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.gaps.cols.size = v
                })
              )
            }}
          />
          <Input
            value={numSort([...new Set(displayProps.gaps.cols.indexes)]).join(
              '; '
            )}
            title="Provide column gaps as semicolon-separated values, e.g. 1; 2; 3"
            onTextChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.gaps.cols.indexes = findIndices(v, colNames)
                })
              )
            }}
            w="sm"
            h="toolbar"
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}

function findIndices(v: string, colNames: string[]): number[] {
  const values = v
    .split(ITEM_REGEX)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s !== '')

  const numIndexes = values.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))

  const nameIndexes = values
    .map((v) => {
      return { idx: colNames.indexOf(v), v }
    })
    .filter((v) => v.idx !== -1)

  // add 1 to idx so gap appears after
  const indexes = numSort([
    ...new Set([...numIndexes, ...nameIndexes.map((v) => v.idx + 1)]),
  ]).filter((n) => n > 0 && n < colNames.length)

  return indexes
}
