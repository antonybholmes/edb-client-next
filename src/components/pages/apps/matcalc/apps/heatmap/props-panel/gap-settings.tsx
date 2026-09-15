import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { produce } from 'immer'

import { PropRow } from '@/components/dialogs/prop-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ITEM_REGEX } from '@/consts'
import { numSort } from '@/lib/math/math'
import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function GapSettingsPanel() {
  const { displayProps, plot, rowLeaves, colLeaves } = useHeatmapContext()
  const { updatePlot } = useHistory()

  const cf = plot.dataframes['main'] as IClusterFrame
  const df = cf.df

  const colNames = colLeaves.map((leaf) => df.columns[leaf].toLowerCase())
  const rowNames = rowLeaves.map((leaf) => df.rowNames[leaf].toLowerCase())

  return (
    <AccordionItem value="gap">
      <AccordionTrigger>Gaps</AccordionTrigger>
      <AccordionContent>
        <PropRow title="Rows">
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
          />
          <NumericalInput
            value={displayProps.gaps.rows.size}
            limit={[0, 1000]}
            dp={0}
            step={1}
            onNumChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.gaps.rows.size = v
                })
              )
            }}
            w="xs"
          />
        </PropRow>

        <PropRow title="Columns">
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
          />
          <NumericalInput
            value={displayProps.gaps.cols.size}
            limit={[0, 1000]}
            dp={0}
            step={1}
            onNumChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.gaps.cols.size = v
                })
              )
            }}
            w="xs"
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
