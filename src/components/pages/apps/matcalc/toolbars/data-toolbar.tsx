import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { DataSortIcon } from '@/components/icons/data-sort-icon'
import { FilterIcon } from '@/components/icons/filter-icon'
import { TransposeIcon } from '@/components/icons/transpose-icon'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarDropdownButton } from '@/components/toolbar/toolbar-dropdown-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@/components/toolbar/toolbar-optional-dropdown-button'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import {
  colZScore,
  log,
  rowStdev,
  rowZScore,
  zscore,
} from '@/lib/dataframe/dataframe-utils'
import { logrankExample } from '@/lib/math/logrank'
import { useSelectionRange } from '@/providers/selection-range-provider'
import { produce } from 'immer'
import { pathJoin } from '../history/history-provider/history-actions'
import {
  useCurrentSheets,
  useFiles,
} from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import { HistoryPlot } from '../history/history-provider/history-types'
import { useMatcalcDialogs } from '../matcalc-dialogs'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export function DataToolbar() {
  const { open: openMatcalcDialog } = useMatcalcDialogs()
  const { file } = useFiles()
  const { sheets } = useCurrentSheets()
  const { addSheets, addPlots } = useHistory()
  const { selection } = useSelectionRange()
  const { settings, updateSettings } = useMatcalcSettings()

  function transpose() {
    const df = (sheets[0] as AnnotationDataFrame).t.setName('Transpose')

    addSheets([df as AnnotationDataFrame])
  }

  function _addPlots(plots: HistoryPlot[]) {
    addPlots(plots)

    updateSettings(
      produce(settings, (draft) => {
        draft.view.panels.tab = pathJoin(file, plots[0]!)
      })
    )
  }

  return (
    <>
      <ToolbarTabGroup title="Matrix">
        <ToolbarIconButton title="Transpose Table" onClick={() => transpose()}>
          <TransposeIcon />
        </ToolbarIconButton>

        <ToolbarOptionalDropdownButton
          //size="md"
          icon="Log2(x)"
          onMainClick={() => {
            addSheets(
              [log(sheets[0] as AnnotationDataFrame, 2, 1)],

              {
                name: 'Log2(x+1)',
              }
            )
          }}
        >
          <DropdownMenuItem
            aria-label="Log2(x)"
            onClick={() =>
              addSheets(
                [log(sheets[0] as AnnotationDataFrame, 2, 0)],

                {
                  name: 'Log2(x)',
                }
              )
            }
          >
            Log2(x)
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Log2(x+1)"
            onClick={() =>
              addSheets(
                [log(sheets[0] as AnnotationDataFrame, 2, 1)],

                {
                  name: 'Log2(x+1)',
                }
              )
            }
          >
            Log2(x+1)
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Log10(x)"
            onClick={() =>
              addSheets(
                [log(sheets[0] as AnnotationDataFrame, 10, 0)],

                {
                  name: 'Log10(x)',
                }
              )
            }
          >
            Log10(x)
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Log10(x+1)"
            onClick={() =>
              addSheets(
                [log(sheets[0] as AnnotationDataFrame, 10, 1)],

                {
                  name: 'Log10(x+1)',
                }
              )
            }
          >
            Log10(x+1)
          </DropdownMenuItem>
        </ToolbarOptionalDropdownButton>

        <ToolbarDropdownButton icon="Z-score">
          <DropdownMenuItem
            aria-label="Z-score rows"
            onClick={() => {
              addSheets(
                [
                  rowZScore(
                    sheets[0] as AnnotationDataFrame
                  ) as AnnotationDataFrame,
                ],

                { name: 'Z-score rows' }
              )
            }}
          >
            Z-score rows
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Z-score columns"
            onClick={() => {
              const df = colZScore(sheets[0] as AnnotationDataFrame)

              addSheets([df as AnnotationDataFrame], {
                name: 'Z-score columns',
              })
            }}
          >
            Z-score columns
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Z-score table"
            onClick={() => {
              const df = zscore(sheets[0] as AnnotationDataFrame)

              addSheets([df as AnnotationDataFrame], {
                name: 'Z-score table',
              })
            }}
          >
            Z-score table
          </DropdownMenuItem>
        </ToolbarDropdownButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Cluster">
        <ToolbarButton
          title="K-means Clustering"
          onClick={() => {
            openMatcalcDialog({
              type: 'kmeans',
              payload: {
                callback: (data: {
                  df: AnnotationDataFrame
                  drawHeatmap: boolean
                }) => {
                  openMatcalcDialog({
                    type: 'heatmap',
                    payload: {
                      sheet: data.df,
                      callback: (plot) => _addPlots([plot]),
                    },
                  })
                },
              },
            })
          }}
        >
          K-means
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Rows">
        <ToolbarIconButton
          title="Filter Top Rows using Statistics"
          onClick={() => {
            openMatcalcDialog({
              type: 'top-rows',
              payload: {},
            })
          }}
        >
          <FilterIcon />
        </ToolbarIconButton>

        <ToolbarIconButton
          title="Sort Columns by Specific Rows"
          onClick={() => {
            if (selection) {
              openMatcalcDialog({
                type: 'sort-rows',
                payload: {
                  selection,
                },
              })
            }
          }}
        >
          <DataSortIcon />
        </ToolbarIconButton>

        <ToolbarButton
          title="Add Row Standard Deviation Column"
          onClick={() => {
            const sd = rowStdev(sheets[0] as AnnotationDataFrame)

            const df = (
              sheets[0] as AnnotationDataFrame
            ).copy() as AnnotationDataFrame
            df.rowObs.setCol('Row Stdev', sd, true)

            //df.setCol('Row Stdev', sd, true)

            addSheets([df], { name: 'Row Standard Deviation' })
            //addStep(df.name, [log(sheet!, 2, 1)])
          }}
        >
          Stdev
        </ToolbarButton>
      </ToolbarTabGroup>

      {process.env.NODE_ENV !== 'development' && (
        <>
          <ToolbarTabGroup title="Clinical">
            <ToolbarButton
              title="Add row standard deviation column to table"
              onClick={() => logrankExample()}
            >
              Survival
            </ToolbarButton>
          </ToolbarTabGroup>
        </>
      )}
    </>
  )
}
