import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import {
  HCluster,
  averageLinkage,
  singleLinkage,
  type IClusterFrame,
  type IClusterTree,
  type IDistFunc,
  type ILinkage,
} from '@/lib/math/hcluster'

import { useEffect, useState } from 'react'

import { SelectItem, SelectList } from '@/themed/v2/select'

import {
  euclidean as euclideanDist,
  pearsond as pearsonDist,
} from '@/lib/math/distance'

import { DEFAULT_HEATMAP_PROPS } from '@/components/plot/heatmap/heatmap-svg-props'
import { HelpButton } from '@/help/help-button'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  getColIdxFromGroup,
  log,
  meanFilter,
  medianFilter,
  rowZScore,
  stdevFilter,
} from '@/lib/dataframe/dataframe-utils'
import { makeUuid } from '@/lib/id'
import { NumericalInput } from '@/themed/numerical-input'
import { Checkbox } from '@/themed/v2/check-box'
import { produce } from 'immer'

import {
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import { DialogCardHeader } from '@/components/dialogs/card/dialog-card'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  useCurrentGroups,
  useCurrentSheets,
} from '../../history/history-provider/history-contexts'
import { newHeatMapPlot } from '../../history/history-provider/history-factories'
import {
  DataFrameType,
  HistoryPlot,
} from '../../history/history-provider/history-types'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

export const MAX_HEATMAP_DIM = 10000

export const MAX_CLUSTER_ITEMS = 1000

const LINKAGE_MAP: { [k: string]: ILinkage } = {
  Average: averageLinkage,
  Single: singleLinkage,
}

const DISTANCE_METRIC_MAP: { [k: string]: IDistFunc } = {
  Correlation: pearsonDist,
  Euclidean: euclideanDist,
}

export interface IProps extends IModalProps<HistoryPlot> {
  sheet?: DataFrameType | undefined
  isClusterMap?: boolean | undefined
}

export function HeatMapDialog({
  sheet,
  open = true,
  isClusterMap = false,
  onResponse,
}: IProps) {
  //const file = useFile()

  const { groups, groupsName } = useCurrentGroups()
  const { sheets } = useCurrentSheets()

  //const [topRows, setTopRows] = useState(1000)
  const [error, setError] = useState('')

  let df = (sheet ?? sheets[0]) as BaseDataFrame

  const { settings, updateSettings } = useMatcalcSettings()

  useEffect(() => {
    // In cluster mode, force column clustering
    if (isClusterMap) {
      updateSettings(
        produce(settings, (draft) => {
          draft.heatmap.cluster.cols = isClusterMap
        })
      )
    }
  }, [isClusterMap])

  function makeCluster() {
    if (!df) {
      onResponse?.(TEXT_CANCEL, undefined)
      return
    }

    let dfToPlot = df

    const groupsToPlot = groups.filter(
      (g) => g.show || settings.groups.filter.mode === 'keep'
    )

    if (groupsToPlot.length > 0 && settings.groups.filter.mode === 'ignore') {
      const idx = groupsToPlot
        .map((group) => getColIdxFromGroup(df, group))
        .flat()

      // if user has chosen to ignore unselected groups, we need to remove them from the dataframe before filtering/clustering
      // which will affect analysis. Hide will just hide them from the plot without affecting analysis.
      dfToPlot = dfToPlot.iloc({ cols: idx })
    }

    if (settings.heatmap.filters.rows.apply) {
      switch (settings.heatmap.filters.rows.method) {
        case 'Mean':
          //dfMean(df, historyDispatch)

          //df = dfMeanFilter(df, historyDispatch, settings.heatmap.topRows)
          dfToPlot = meanFilter(dfToPlot, settings.heatmap.filters.rows.top)
          break
        case 'Median':
          //dfMedian(df, historyDispatch)

          //df = dfMedianFilter(df, historyDispatch, settings.heatmap.topRows)
          dfToPlot = medianFilter(dfToPlot, settings.heatmap.filters.rows.top)
          break
        default:
          // stdev
          //dfStdev(df, historyDispatch)

          //df = dfStdevFilter(df, historyDispatch, settings.heatmap.topRows)
          dfToPlot = stdevFilter(dfToPlot, settings.heatmap.filters.rows.top)
          break
      }

      if (!dfToPlot) {
        onResponse?.(TEXT_CANCEL, undefined)
        return
      }
    }

    // stop user trying to cluster something excessive
    if (settings.heatmap.cluster.rows && df.shape[0] > MAX_CLUSTER_ITEMS) {
      setError(
        `You can cluster ${MAX_CLUSTER_ITEMS.toLocaleString()} rows. Please reduce the number of rows in your table.`
      )
      return
    }

    if (!settings.heatmap.cluster.rows && df.shape[0] > MAX_HEATMAP_DIM) {
      setError(
        `You can plot up to ${MAX_HEATMAP_DIM.toLocaleString()} rows. Please reduce the number of rows in your table.`
      )
      return
    }

    if (settings.heatmap.cluster.cols && df.shape[1] > MAX_CLUSTER_ITEMS) {
      setError(
        `You can cluster ${MAX_CLUSTER_ITEMS.toLocaleString()} columns. Please reduce the number of columns in your table.`
      )
      return
    }

    if (!settings.heatmap.cluster.cols && df.shape[1] > MAX_HEATMAP_DIM) {
      setError(
        `You can plot up to ${MAX_HEATMAP_DIM.toLocaleString()} columns. Please reduce the number of columns in your table.`
      )
      return
    }

    const actions: string[] = []

    if (settings.heatmap.transforms.apply && settings.heatmap.transforms.log2) {
      dfToPlot = log(dfToPlot, 2, 1)
      actions.push('Log2')
    }

    if (
      settings.heatmap.transforms.apply &&
      settings.heatmap.transforms.rowZscore
    ) {
      dfToPlot = rowZScore(dfToPlot!) //dfRowZScore(df, historyDispatch)
      actions.push('Row z-score')
    }

    if (
      settings.heatmap.transforms.apply &&
      settings.heatmap.transforms.transpose
    ) {
      dfToPlot = dfToPlot!.t //dfTranspose(df, historyDispatch)
      actions.push('Transpose')
    }

    if (!dfToPlot) {
      onResponse?.(TEXT_CANCEL, undefined)
      return
    }

    const linkageFunc: ILinkage = LINKAGE_MAP[settings.heatmap.cluster.linkage]!
    const distFunc: IDistFunc =
      DISTANCE_METRIC_MAP[settings.heatmap.cluster.distance]!

    const hc = new HCluster(linkageFunc, distFunc)

    let rowC: IClusterTree | undefined = undefined
    let colC: IClusterTree | undefined = undefined

    if (settings.heatmap.cluster.rows && df.shape[0] <= MAX_CLUSTER_ITEMS) {
      rowC = hc.run(dfToPlot)
      actions.push('Cluster rows')
    }

    if (settings.heatmap.cluster.cols && df.shape[1] <= MAX_CLUSTER_ITEMS) {
      colC = hc.run(dfToPlot.t)
      actions.push('Cluster columns')
    }

    const cf: IClusterFrame = {
      id: makeUuid(),
      name: 'Heatmap Cluster Frame',
      rowTree: rowC,
      colTree: colC,
      df: dfToPlot as AnnotationDataFrame,
    }

    const displayOptions = produce(DEFAULT_HEATMAP_PROPS, (draft) => {
      draft.legend.title.text = groupsName
    })

    const plot: HistoryPlot = newHeatMapPlot(
      `Heatmap`,
      { main: cf },
      {
        style: 'heatmap',
        groups: groupsToPlot,
        props: displayOptions,
        actions,
      }
    )

    onResponse?.(TEXT_OK, plot)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Heatmap"
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r, undefined)
        } else {
          makeCluster()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 3xl:w-1/4"
      //contentVariant="glass"
      //bodyVariant="card"
      leftFooterChildren={<HelpButton url="/help/apps/matcalc/heatmap" />}
      bodyCls="gap-y-2"
    >
      <ActionDialogCard>
        <DialogCardHeader>
          <Checkbox
            checked={settings.heatmap.filters.rows.apply}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.filters.rows.apply = v
              })

              updateSettings(newSettings)
            }}
          >
            Filter
          </Checkbox>
        </DialogCardHeader>
        <ActionDialogCardContent>
          <ActionDialogRow title="Top" justify="start">
            <NumericalInput
              id="top-rows"
              limit={[0, 5000]}
              value={settings.heatmap.filters.rows.top}
              onNumChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.filters.rows.top = v
                })

                updateSettings(newSettings)
              }}
              disabled={!settings.heatmap.filters.rows.apply}
              w="xs"
            />
            <span className="shrink-0">rows using</span>
            <SelectList
              value={settings.heatmap.filters.rows.method}
              disabled={!settings.heatmap.filters.rows.apply}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.heatmap.filters.rows.method = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              w="sm"
            >
              <SelectItem value="Stdev">Stdev</SelectItem>
              <SelectItem value="Mean">Mean</SelectItem>
              <SelectItem value="Median">Median</SelectItem>
            </SelectList>
          </ActionDialogRow>
          <ActionDialogRow title="Unselected Groups">
            <SelectList
              value={settings.groups.filter.mode}
              disabled={!settings.heatmap.filters.rows.apply}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.groups.filter.mode = v as 'keep' | 'hide' | 'ignore'
                  })

                  updateSettings(newSettings)
                }
              }}
              w="md"
              items={[
                { value: 'keep', label: 'Keep' },
                { value: 'hide', label: 'Hide' },
                { value: 'ignore', label: 'Remove' },
              ]}
            >
              <SelectItem value="keep">Keep</SelectItem>
              <SelectItem value="hide">Hide</SelectItem>
              <SelectItem value="ignore">Remove</SelectItem>
            </SelectList>
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>

      <LineSeparator />

      <ActionDialogCard>
        <DialogCardHeader>
          <Checkbox
            checked={settings.heatmap.transforms.apply}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.transforms.apply = v
              })

              updateSettings(newSettings)
            }}
          >
            Transform
          </Checkbox>
        </DialogCardHeader>

        <ActionDialogCardContent>
          <ActionDialogRow>
            <Checkbox
              checked={settings.heatmap.transforms.log2}
              disabled={!settings.heatmap.transforms.apply}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.transforms.log2 = v
                })

                updateSettings(newSettings)
              }}
            >
              Log2(data+1)
            </Checkbox>
          </ActionDialogRow>
          <ActionDialogRow>
            <Checkbox
              checked={settings.heatmap.transforms.rowZscore}
              disabled={!settings.heatmap.transforms.apply}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.transforms.rowZscore = v
                })

                updateSettings(newSettings)
              }}
            >
              Z-score rows
            </Checkbox>
          </ActionDialogRow>
          <ActionDialogRow>
            <Checkbox
              checked={settings.heatmap.transforms.transpose}
              disabled={!settings.heatmap.transforms.apply}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.transforms.transpose = v
                })

                updateSettings(newSettings)
              }}
            >
              Transpose
            </Checkbox>
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>

      <LineSeparator />

      <ActionDialogCard>
        <DialogCardHeader>
          <Checkbox
            checked={settings.heatmap.cluster.apply}
            disabled={!settings.heatmap.transforms.apply}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.cluster.apply = v
              })

              updateSettings(newSettings)
            }}
          >
            Clustering
          </Checkbox>
        </DialogCardHeader>

        <ActionDialogCardContent>
          <ActionDialogRow>
            <Checkbox
              disabled={!settings.heatmap.cluster.apply}
              checked={settings.heatmap.cluster.rows}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.cluster.rows = v
                })

                updateSettings(newSettings)
              }}
            >
              Rows
            </Checkbox>
          </ActionDialogRow>
          <ActionDialogRow>
            <Checkbox
              disabled={!settings.heatmap.cluster.apply}
              checked={settings.heatmap.cluster.cols}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.cluster.cols = v
                })

                updateSettings(newSettings)
              }}
            >
              Columns
            </Checkbox>
          </ActionDialogRow>

          <ActionDialogRow title="Linkage">
            <SelectList
              disabled={!settings.heatmap.cluster.apply}
              value={settings.heatmap.cluster.linkage}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.heatmap.cluster.linkage = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              w="md"
            >
              <SelectItem value="Average">Average</SelectItem>

              <SelectItem value="Single">Single</SelectItem>
            </SelectList>
          </ActionDialogRow>

          <ActionDialogRow title="Distance">
            <SelectList
              disabled={!settings.heatmap.cluster.apply}
              value={settings.heatmap.cluster.distance}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.heatmap.cluster.distance = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              w="md"
            >
              <SelectItem value="Correlation">Correlation</SelectItem>

              <SelectItem value="Euclidean">Euclidean</SelectItem>
            </SelectList>
          </ActionDialogRow>

          {/* <DialogCardInfo>
            Apply hierarchical row/column clustering.
          </DialogCardInfo> */}
        </ActionDialogCardContent>
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
