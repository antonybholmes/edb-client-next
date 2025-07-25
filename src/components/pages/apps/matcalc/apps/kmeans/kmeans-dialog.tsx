import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import { VCenterRow } from '@layout/v-center-row'
import { type IDistFunc } from '@lib/math/hcluster'
import { useState } from 'react'

import { SelectItem, SelectList } from '@themed/select'

import {
  euclidean as euclideanDist,
  pearsond as pearsonDist,
} from '@lib/math/distance'

import { SettingsAccordionItem } from '@dialog/settings/settings-dialog'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import {
  kmeans,
  log,
  meanFilter,
  medianFilter,
  rowZScore,
  stdevFilter,
} from '@lib/dataframe/dataframe-utils'
import { argsort } from '@lib/math/argsort'
import { Accordion } from '@themed/accordion'
import { Checkbox } from '@themed/check-box'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useHistory } from '../../history/history-store'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

export const MAX_HEATMAP_DIM = 10000

export const MAX_CLUSTER_ITEMS = 1000

const DISTANCE_METRIC_MAP: Record<string, IDistFunc> = {
  Correlation: pearsonDist,
  Euclidean: euclideanDist,
}

export interface IProps extends IModalProps {
  open?: boolean
  //df: AnnotationDataFrame
  isClusterMap?: boolean
}

export function KmeansDialog({
  open = true,

  onResponse,
}: IProps) {
  //const [linkage, setLinkage] = useState("Average")
  //const [distanceMetric, setDistanceMetric] = useState("Correlation")

  const { settings, updateSettings } = useMatcalcSettings()
  const { sheet, addStep } = useHistory()

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheet //currentSheet(step)[0]

  const [error] = useState('')

  function makeClusters() {
    if (!df) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    if (settings.apps.kmeans.applyLog2) {
      df = log(df, 2, 1) as AnnotationDataFrame
    }

    if (settings.apps.kmeans.applyZscore) {
      df = rowZScore(df) as AnnotationDataFrame //dfRowZScore(df, historyDispatch)
    }

    if (settings.apps.kmeans.filterRows) {
      switch (settings.apps.kmeans.rowFilterMethod) {
        case 'Mean':
          //dfMean(df, historyDispatch)

          //df = dfMeanFilter(df, historyDispatch, settings.heatmap.topRows)
          df = meanFilter(df, settings.heatmap.topRows) as AnnotationDataFrame
          break
        case 'Median':
          //dfMedian(df, historyDispatch)

          //df = dfMedianFilter(df, historyDispatch, settings.heatmap.topRows)
          df = medianFilter(df, settings.heatmap.topRows) as AnnotationDataFrame
          break
        default:
          // stdev
          //dfStdev(df, historyDispatch)

          //df = dfStdevFilter(df, historyDispatch, settings.heatmap.topRows)
          df = stdevFilter(df, settings.heatmap.topRows) as AnnotationDataFrame
          break
      }
    }

    const distFunc: IDistFunc =
      DISTANCE_METRIC_MAP[settings.apps.kmeans.distance]!

    //console.log(distanceMetric, distFunc)

    let clusters: number[]

    if (settings.apps.kmeans.clusterRows) {
      ;[df, clusters] = kmeans(
        df as AnnotationDataFrame,
        settings.apps.kmeans.clusters,
        distFunc
      )

      if (settings.apps.kmeans.sortByCluster) {
        //const clusters = df.rowMetaData.col('Cluster').values as string[]

        const idx = argsort(clusters)

        df = df.iloc(idx, ':') as AnnotationDataFrame
      }
    }

    if (settings.apps.kmeans.clusterCols) {
      ;[df, clusters] = kmeans(
        df.t as AnnotationDataFrame,
        settings.apps.kmeans.clusters,
        distFunc
      )

      df = df.t as AnnotationDataFrame

      if (settings.apps.kmeans.sortByCluster) {
        //const clusters = df.colMetaData.col('Cluster').values as string[]

        const idx = argsort(clusters)

        df = df.iloc(':', idx) as AnnotationDataFrame
      }
    }

    addStep('K-means', [df.setName('K-means') as AnnotationDataFrame])

    onResponse?.(TEXT_OK, {
      df,
      drawHeatmap: settings.apps.kmeans.showHeatmap,
    })
  }

  return (
    <OKCancelDialog
      open={open}
      title="K-means"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r)
        } else {
          makeClusters()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 3xl:w-1/4"
      //contentVariant="glass"
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
              checked={settings.apps.kmeans.filterRows}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.apps.kmeans.filterRows = v
                })

                updateSettings(newSettings)
              }}
            />
            <span>Top</span>
            <NumericalInput
              id="top-rows"
              value={settings.apps.kmeans.topRows}
              limit={[0, 10000]}
              step={1}
              onNumChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.apps.kmeans.topRows = v
                })

                updateSettings(newSettings)
              }}
              className="w-20 rounded-theme"
            />
            <span className="shrink-0">rows using</span>
            <SelectList
              value={settings.apps.kmeans.rowFilterMethod}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.apps.kmeans.rowFilterMethod = v
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
            checked={settings.apps.kmeans.applyLog2}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.apps.kmeans.applyLog2 = v
              })

              updateSettings(newSettings)
            }}
          >
            Log2(data+1)
          </Checkbox>

          <Checkbox
            checked={settings.apps.kmeans.applyZscore}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.apps.kmeans.applyZscore = v
              })

              updateSettings(newSettings)
            }}
          >
            Z-score
          </Checkbox>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Cluster">
          <VCenterRow className="gap-x-2 py-1">
            <span className="w-20">K</span>
            <NumericalInput
              value={settings.apps.kmeans.clusters}
              limit={[0, 1000]}
              step={1}
              onNumChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.apps.kmeans.clusters = v
                })

                updateSettings(newSettings)
              }}
              className="w-16 rounded-theme"
            />
          </VCenterRow>

          <VCenterRow className="gap-x-2 py-1">
            <span className="w-20">Distance</span>
            <SelectList
              value={settings.apps.kmeans.distance}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.apps.kmeans.distance = v
                })

                updateSettings(newSettings)
              }}
              className="w-40"
            >
              <SelectItem value="Correlation">Correlation</SelectItem>

              <SelectItem value="Euclidean">Euclidean</SelectItem>
            </SelectList>
          </VCenterRow>

          {/* <Checkbox
            checked={settings.modules.kmeans.clusterRows}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.modules.kmeans.clusterRows = v
              })

              updateSettings(newSettings)
            }}
          >
            Rows
          </Checkbox>

          <Checkbox
            checked={settings.modules.kmeans.clusterCols}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.modules.kmeans.clusterCols = v
              })

              updateSettings(newSettings)
            }}
          >
            Columns
          </Checkbox> */}

          <Checkbox
            checked={settings.apps.kmeans.sortByCluster}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.apps.kmeans.sortByCluster = v
              })

              updateSettings(newSettings)
            }}
          >
            Sort by cluster
          </Checkbox>

          <Checkbox
            checked={settings.apps.kmeans.showHeatmap}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.apps.kmeans.showHeatmap = v
              })

              updateSettings(newSettings)
            }}
          >
            Show heatmap
          </Checkbox>
        </SettingsAccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
