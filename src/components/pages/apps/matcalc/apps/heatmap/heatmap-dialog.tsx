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
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
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
  DialogCard,
  DialogCardContent,
  DialogCardHeader,
} from '@/components/dialogs/card/dialog-card'
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
          draft.heatmap.clusterCols = isClusterMap
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

    if (settings.heatmap.filterRows) {
      switch (settings.heatmap.rowFilterMethod) {
        case 'Mean':
          //dfMean(df, historyDispatch)

          //df = dfMeanFilter(df, historyDispatch, settings.heatmap.topRows)
          dfToPlot = meanFilter(dfToPlot, settings.heatmap.topRows)
          break
        case 'Median':
          //dfMedian(df, historyDispatch)

          //df = dfMedianFilter(df, historyDispatch, settings.heatmap.topRows)
          dfToPlot = medianFilter(dfToPlot, settings.heatmap.topRows)
          break
        default:
          // stdev
          //dfStdev(df, historyDispatch)

          //df = dfStdevFilter(df, historyDispatch, settings.heatmap.topRows)
          dfToPlot = stdevFilter(dfToPlot, settings.heatmap.topRows)
          break
      }

      if (!dfToPlot) {
        onResponse?.(TEXT_CANCEL, undefined)
        return
      }
    }

    // stop user trying to cluster something excessive
    if (settings.heatmap.clusterRows && df.shape[0] > MAX_CLUSTER_ITEMS) {
      setError(
        `You can cluster ${MAX_CLUSTER_ITEMS.toLocaleString()} rows. Please reduce the number of rows in your table.`
      )
      return
    }

    if (!settings.heatmap.clusterRows && df.shape[0] > MAX_HEATMAP_DIM) {
      setError(
        `You can plot up to ${MAX_HEATMAP_DIM.toLocaleString()} rows. Please reduce the number of rows in your table.`
      )
      return
    }

    if (settings.heatmap.clusterCols && df.shape[1] > MAX_CLUSTER_ITEMS) {
      setError(
        `You can cluster ${MAX_CLUSTER_ITEMS.toLocaleString()} columns. Please reduce the number of columns in your table.`
      )
      return
    }

    if (!settings.heatmap.clusterCols && df.shape[1] > MAX_HEATMAP_DIM) {
      setError(
        `You can plot up to ${MAX_HEATMAP_DIM.toLocaleString()} columns. Please reduce the number of columns in your table.`
      )
      return
    }

    const actions: string[] = []

    if (settings.heatmap.applyLog2) {
      dfToPlot = log(dfToPlot, 2, 1)
      actions.push('Log2')
    }

    if (settings.heatmap.applyRowZscore) {
      dfToPlot = rowZScore(dfToPlot!) //dfRowZScore(df, historyDispatch)
      actions.push('Row z-score')
    }

    if (settings.heatmap.applyTranspose) {
      dfToPlot = dfToPlot!.t //dfTranspose(df, historyDispatch)
      actions.push('Transpose')
    }

    if (!dfToPlot) {
      onResponse?.(TEXT_CANCEL, undefined)
      return
    }

    const linkageFunc: ILinkage = LINKAGE_MAP[settings.heatmap.linkage]!
    const distFunc: IDistFunc = DISTANCE_METRIC_MAP[settings.heatmap.distance]!

    const hc = new HCluster(linkageFunc, distFunc)

    let rowC: IClusterTree | undefined = undefined
    let colC: IClusterTree | undefined = undefined

    if (settings.heatmap.clusterRows && df.shape[0] <= MAX_CLUSTER_ITEMS) {
      rowC = hc.run(dfToPlot)
      actions.push('Cluster rows')
    }

    if (settings.heatmap.clusterCols && df.shape[1] <= MAX_CLUSTER_ITEMS) {
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
      bodyCls="gap-y-3"
    >
      <DialogCard>
        <DialogCardHeader title="Filter" />

        <DialogCardContent>
          <CheckPropRow
            title="Top"
            info="Filter to top N most variable rows by the method you choose."
            checked={settings.heatmap.filterRows}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.filterRows = v
              })

              updateSettings(newSettings)
            }}
          >
            <NumericalInput
              id="top-rows"
              limit={[0, 5000]}
              value={settings.heatmap.topRows}
              onNumChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.heatmap.topRows = v
                })

                updateSettings(newSettings)
              }}
              w="xs"
            />
            <span className="shrink-0">rows using</span>
            <SelectList
              value={settings.heatmap.rowFilterMethod}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.heatmap.rowFilterMethod = v as string
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
          </CheckPropRow>

          <PropRow
            title="Unselected Groups"
            info="Hide will not affect your original data. Remove will affect your analysis."
          >
            <SelectList
              value={settings.groups.filter.mode}
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
          </PropRow>
          {/* <DialogCardInfo>Filter table before plotting.</DialogCardInfo> */}
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardHeader title="Transform" />

        <DialogCardContent>
          <Checkbox
            checked={settings.heatmap.applyLog2}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.applyLog2 = v
              })

              updateSettings(newSettings)
            }}
          >
            Log2(data+1)
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.applyRowZscore}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.applyRowZscore = v
              })

              updateSettings(newSettings)
            }}
          >
            Z-score rows
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.applyTranspose}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.applyTranspose = v
              })

              updateSettings(newSettings)
            }}
          >
            Transpose
          </Checkbox>

          {/* <DialogCardInfo>
            Apply transformations to data before plotting.
          </DialogCardInfo> */}
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardHeader title="Clustering" />

        <DialogCardContent>
          <Checkbox
            checked={settings.heatmap.clusterRows}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.clusterRows = v
              })

              updateSettings(newSettings)
            }}
          >
            Rows
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.clusterCols}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.clusterCols = v
              })

              updateSettings(newSettings)
            }}
          >
            Columns
          </Checkbox>

          <PropRow title="Linkage">
            <SelectList
              value={settings.heatmap.linkage}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.heatmap.linkage = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              w="md"
            >
              <SelectItem value="Average">Average</SelectItem>

              <SelectItem value="Single">Single</SelectItem>
            </SelectList>
          </PropRow>

          <PropRow title="Distance">
            <SelectList
              value={settings.heatmap.distance}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.heatmap.distance = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              w="md"
            >
              <SelectItem value="Correlation">Correlation</SelectItem>

              <SelectItem value="Euclidean">Euclidean</SelectItem>
            </SelectList>
          </PropRow>

          {/* <DialogCardInfo>
            Apply hierarchical row/column clustering.
          </DialogCardInfo> */}
        </DialogCardContent>
      </DialogCard>
    </OKCancelDialog>
  )
}
