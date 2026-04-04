import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialog/ok-cancel-dialog'
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

import { CheckPropRow } from '@/components/dialog/check-prop-row'
import { PropRow } from '@/components/dialog/prop-row'
import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { DEFAULT_HEATMAP_PROPS } from '@/components/plot/heatmap/heatmap-svg-props'
import { Accordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { VScrollPanel } from '@/components/v-scroll-panel'
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
  newHeatMapPlot,
  useGroupName,
  useGroups,
  useSheet,
  type HistoryPlot,
} from '../../history/history-store'
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

export interface IProps extends IModalProps {
  //df: BaseDataFrame | null
  isClusterMap?: boolean
}

export function HeatMapDialog({
  open = true,
  //df,
  isClusterMap = false,
  onResponse,
}: IProps) {
  //const [linkage, setLinkage] = useState("Average")
  //const [distanceMetric, setDistanceMetric] = useState("Correlation")

  //const file = useFile()
  const sheet = useSheet()
  const groups = useGroups()
  const groupName = useGroupName()

  //const [topRows, setTopRows] = useState(1000)
  const [error, setError] = useState('')

  let df = sheet as BaseDataFrame

  const { settings, updateSettings } = useMatcalcSettings()

  useEffect(() => {
    // In cluster mode, force column clustering
    if (isClusterMap) {
      // updateSettings({
      //   ...settings,
      //   heatmap: { ...settings.heatmap, clusterCols: isClusterMap },
      // })

      updateSettings(
        produce(settings, draft => {
          draft.heatmap.clusterCols = isClusterMap
        })
      )
    }
  }, [isClusterMap])

  function makeCluster() {
    if (!df) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    const groupsToPlot = groups.filter(
      g => g.show || settings.groups.filter.mode === 'keep'
    )

    console.log(df.shape)

    const idx = groupsToPlot.map(group => getColIdxFromGroup(df, group)).flat()

    // if user has chosen to ignore unselected groups, we need to remove them from the dataframe before filtering/clustering
    // which will affect analysis. Hide will just hide them from the plot without affecting analysis.
    let dfToPlot =
      settings.groups.filter.mode === 'ignore' ? df.iloc({ cols: idx }) : df

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
        onResponse?.(TEXT_CANCEL)
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

    console.log('df to plot', dfToPlot.shape)

    if (settings.heatmap.applyRowZscore) {
      dfToPlot = rowZScore(dfToPlot!) //dfRowZScore(df, historyDispatch)
      actions.push('Row z-score')
    }

    console.log('df to plot1', dfToPlot)

    if (settings.heatmap.applyTranspose) {
      dfToPlot = dfToPlot!.t //dfTranspose(df, historyDispatch)
      actions.push('Transpose')
    }

    if (!dfToPlot) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    const linkageFunc: ILinkage = LINKAGE_MAP[settings.heatmap.linkage]!
    const distFunc: IDistFunc = DISTANCE_METRIC_MAP[settings.heatmap.distance]!

    //console.log(distanceMetric, distFunc)

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

    const displayOptions = produce(DEFAULT_HEATMAP_PROPS, draft => {
      draft.legend.title.text = groupName
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

    //console.log('aha', plot, history)

    //_addPlots([plot])

    onResponse?.(TEXT_OK, plot)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Heatmap"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r)
        } else {
          makeCluster()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 3xl:w-1/4"
      //contentVariant="glass"
      //bodyVariant="card"
      leftFooterChildren={<HelpButton url="/help/apps/matcalc/heatmap" />}
    >
      <VScrollPanel className="grow h-80">
        {error && (
          <span className="text-destructive bg-red-50 border border-red-200 px-3 py-2 rounded-theme">
            {error}
          </span>
        )}

        <Accordion
          multiple={true}
          defaultValue={['filter', 'transform', 'clustering']}
          variant="settings"
        >
          <SettingsAccordionItem
            title="Filter"
            description="Filter table before plotting."
            showBorder={false}
          >
            <CheckPropRow
              title="Top"
              checked={settings.heatmap.filterRows}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.filterRows = v
                })

                updateSettings(newSettings)
              }}
            >
              <NumericalInput
                id="top-rows"
                limit={[0, 5000]}
                value={settings.heatmap.topRows}
                onNumChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.heatmap.topRows = v
                  })

                  updateSettings(newSettings)
                }}
                w="sm"
              />
              <span className="shrink-0">rows using</span>
              <SelectList
                value={settings.heatmap.rowFilterMethod}
                onValueChange={v => {
                  if (v) {
                    const newSettings = produce(settings, draft => {
                      draft.heatmap.rowFilterMethod = v as string
                    })

                    updateSettings(newSettings)
                  }
                }}
                w="md"
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
                onValueChange={v => {
                  if (v) {
                    const newSettings = produce(settings, draft => {
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
          </SettingsAccordionItem>

          <SettingsAccordionItem
            title="Transform"
            description="Apply transformations to data before plotting."
          >
            <Checkbox
              checked={settings.heatmap.applyLog2}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.applyLog2 = v
                })

                updateSettings(newSettings)
              }}
            >
              Log2(data+1)
            </Checkbox>

            <Checkbox
              checked={settings.heatmap.applyRowZscore}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.applyRowZscore = v
                })

                updateSettings(newSettings)
              }}
            >
              Z-score rows
            </Checkbox>

            <Checkbox
              checked={settings.heatmap.applyTranspose}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.applyTranspose = v
                })

                updateSettings(newSettings)
              }}
            >
              Transpose
            </Checkbox>
          </SettingsAccordionItem>

          <SettingsAccordionItem
            title="Clustering"
            description="Cluster rows and columns before plotting."
          >
            <Checkbox
              checked={settings.heatmap.clusterRows}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.clusterRows = v
                })

                updateSettings(newSettings)
              }}
            >
              Rows
            </Checkbox>

            <Checkbox
              checked={settings.heatmap.clusterCols}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
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
                onValueChange={v => {
                  if (v) {
                    const newSettings = produce(settings, draft => {
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
                onValueChange={v => {
                  if (v) {
                    const newSettings = produce(settings, draft => {
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
          </SettingsAccordionItem>
        </Accordion>
      </VScrollPanel>
    </OKCancelDialog>
  )
}
