import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import { VCenterRow } from '@layout/v-center-row'
import {
  HCluster,
  averageLinkage,
  singleLinkage,
  type IClusterFrame,
  type IClusterTree,
  type IDistFunc,
  type ILinkage,
} from '@lib/math/hcluster'

import { useEffect, useState } from 'react'

import { SelectItem, SelectList } from '@themed/select'

import {
  euclidean as euclideanDist,
  pearsond as pearsonDist,
} from '@lib/math/distance'

import { DEFAULT_HEATMAP_PROPS } from '@components/plot/heatmap/heatmap-svg-props'
import { SettingsAccordionItem } from '@dialog/settings/settings-dialog'
import { HelpButton } from '@help/help-button'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import {
  log,
  meanFilter,
  medianFilter,
  rowZScore,
  stdevFilter,
} from '@lib/dataframe/dataframe-utils'
import { Accordion } from '@themed/accordion'
import { Checkbox } from '@themed/check-box'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { newPlot, useHistory, type IPlot } from '../../history/history-store'
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

  const { sheet, addPlots, groups } = useHistory()
  //const [topRows, setTopRows] = useState(1000)
  const [error, setError] = useState('')

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheet

  const { settings, updateSettings } = useMatcalcSettings()

  //console.log(settings)

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

    if (settings.heatmap.filterRows) {
      switch (settings.heatmap.rowFilterMethod) {
        case 'Mean':
          //dfMean(df, historyDispatch)

          //df = dfMeanFilter(df, historyDispatch, settings.heatmap.topRows)
          df = meanFilter(df, settings.heatmap.topRows)
          break
        case 'Median':
          //dfMedian(df, historyDispatch)

          //df = dfMedianFilter(df, historyDispatch, settings.heatmap.topRows)
          df = medianFilter(df, settings.heatmap.topRows)
          break
        default:
          // stdev
          //dfStdev(df, historyDispatch)

          //df = dfStdevFilter(df, historyDispatch, settings.heatmap.topRows)
          df = stdevFilter(df, settings.heatmap.topRows)
          break
      }

      if (!df) {
        onResponse?.(TEXT_CANCEL)
        return
      }
    }

    // stop user trying to cluster something excessive
    if (settings.heatmap.clusterRows && df.shape[0] > MAX_CLUSTER_ITEMS) {
      setError(
        `You can only cluster up to ${MAX_CLUSTER_ITEMS.toLocaleString()} rows. Please reduce the size of your table.`
      )
      return
    }

    if (!settings.heatmap.clusterRows && df.shape[0] > MAX_HEATMAP_DIM) {
      setError(
        `You can only plot up to ${MAX_HEATMAP_DIM.toLocaleString()} rows. Please reduce the size of your table.`
      )
      return
    }

    if (settings.heatmap.clusterCols && df.shape[1] > MAX_CLUSTER_ITEMS) {
      setError(
        `You can only cluster up to ${MAX_CLUSTER_ITEMS.toLocaleString()} columns. Please reduce the size of your table.`
      )
      return
    }

    if (!settings.heatmap.clusterCols && df.shape[1] > MAX_HEATMAP_DIM) {
      setError(
        `You can only plot up to ${MAX_HEATMAP_DIM.toLocaleString()} columns. Please reduce the size of in your table.`
      )
      return
    }

    if (settings.heatmap.applyLog2) {
      df = log(df, 2, 1)
    }

    if (settings.heatmap.applyRowZscore) {
      df = rowZScore(df!) //dfRowZScore(df, historyDispatch)
    }

    if (settings.heatmap.applyTranspose) {
      df = df!.t //dfTranspose(df, historyDispatch)
    }

    if (!df) {
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
      rowC = hc.run(df)
    }

    if (settings.heatmap.clusterCols && df.shape[1] <= MAX_CLUSTER_ITEMS) {
      colC = hc.run(df.t)
    }

    const cf: IClusterFrame = {
      rowTree: rowC,
      colTree: colC,
      df: df as AnnotationDataFrame,
    }

    const plot: IPlot = {
      ...newPlot('Heatmap', { main: cf }, 'heatmap'),
      groups,
      customProps: {
        displayOptions: { ...DEFAULT_HEATMAP_PROPS },
      },
    }

    //console.log('aha', plot, history)

    addPlots([plot])

    onResponse?.(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title={'Heatmap'}
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
      leftFooterChildren={
        <HelpButton url="/help/applications/matcalc/heatmap" />
      }
    >
      {error && <span className="text-destructive">{error}</span>}
      <Accordion
        type="multiple"
        defaultValue={['filter', 'transform', 'cluster']}
        //className="bg-background rounded-lg p-4"
      >
        <SettingsAccordionItem title="Filter">
          <VCenterRow className="gap-x-2">
            <Checkbox
              checked={settings.heatmap.filterRows}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.filterRows = v
                })

                updateSettings(newSettings)
              }}
            />
            <span>Top</span>
            <NumericalInput
              id="top-rows"
              limit={[0, 5000]}
              value={settings.heatmap.topRows.toString()}
              onNumChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.topRows = v
                })

                updateSettings(newSettings)
              }}
              className="w-20 rounded-theme"
            />
            <span className="shrink-0">rows using</span>
            <SelectList
              value={settings.heatmap.rowFilterMethod}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.rowFilterMethod = v
                })

                updateSettings(newSettings)
              }}
              className="w-32"
            >
              <SelectItem value="Stdev">Stdev</SelectItem>
              <SelectItem value="Mean">Mean</SelectItem>
              <SelectItem value="Median">Median</SelectItem>
            </SelectList>
          </VCenterRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Transform">
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

        <SettingsAccordionItem title="Cluster">
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

          <VCenterRow>
            <span className="w-24">Linkage</span>
            <SelectList
              value={settings.heatmap.linkage}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.linkage = v
                })

                updateSettings(newSettings)
              }}
              className="w-40"
            >
              <SelectItem value="Average">Average</SelectItem>

              <SelectItem value="Single">Single</SelectItem>
            </SelectList>
          </VCenterRow>

          <VCenterRow>
            <span className="w-24">Distance</span>
            <SelectList
              value={settings.heatmap.distance}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.heatmap.distance = v
                })

                updateSettings(newSettings)
              }}
              className="w-40"
            >
              <SelectItem value="Correlation">Correlation</SelectItem>

              <SelectItem value="Euclidean">Euclidean</SelectItem>
            </SelectList>
          </VCenterRow>
        </SettingsAccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
