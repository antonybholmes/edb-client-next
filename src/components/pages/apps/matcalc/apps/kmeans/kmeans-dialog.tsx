import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { VCenterRow } from '@/layout/v-center-row'
import { type IDistFunc } from '@/lib/math/hcluster'
import { useState } from 'react'

import { SelectItem, SelectList } from '@/themed/v2/select'

import {
  euclidean as euclideanDist,
  pearsond as pearsonDist,
} from '@/lib/math/distance'

import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import {
  kmeans,
  log,
  meanFilter,
  medianFilter,
  rowZScore,
  stdevFilter,
} from '@/lib/dataframe/dataframe-utils'
import { argsort } from '@/lib/math/argsort'
import { NumericalInput } from '@/themed/numerical-input'
import { Checkbox } from '@/themed/v2/check-box'
import { produce } from 'immer'

import {
  DialogCard,
  DialogCardContent,
  DialogCardInfo,
  DialogCardLabel,
} from '@/components/dialogs/card/dialog-card'
import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { useCurrentSheets } from '../../history/history-provider/history-contexts'
import { useHistory } from '../../history/history-provider/history-provider'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

export const MAX_HEATMAP_DIM = 10000

export const MAX_CLUSTER_ITEMS = 1000

const DISTANCE_METRIC_MAP: Record<string, IDistFunc> = {
  Correlation: pearsonDist,
  Euclidean: euclideanDist,
}

export interface IProps extends IModalProps<{
  df: AnnotationDataFrame
  drawHeatmap: boolean
}> {
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
  const { addSheets } = useHistory()
  const { sheets } = useCurrentSheets()

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheets[0] as AnnotationDataFrame

  const [error] = useState('')

  function makeClusters() {
    if (!df) {
      onResponse?.(TEXT_CANCEL, undefined)
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

    let clusters: number[]

    if (settings.apps.kmeans.clusterRows) {
      ;[df, clusters] = kmeans(
        df as AnnotationDataFrame,
        settings.apps.kmeans.clusters,
        distFunc
      )

      if (settings.apps.kmeans.sortByCluster) {
        const idx = argsort(clusters)

        df = df.iloc({ rows: idx }) as AnnotationDataFrame
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

        df = df.iloc({ cols: idx }) as AnnotationDataFrame
      }
    }

    addSheets([df.setName('K-means')], { name: 'K-means' })

    onResponse?.(TEXT_OK, {
      df,
      drawHeatmap: settings.apps.kmeans.showHeatmap,
    })
  }

  return (
    <OKCancelDialog
      open={open}
      title="K-means"
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r, undefined)
        } else {
          makeClusters()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 3xl:w-1/4"
      //contentVariant="glass"
      bodyCls="gap-y-3"
    >
      {error && <span className="text-destructive">{error}</span>}

      <DialogCard>
        <DialogCardLabel title="Filter">
          <DialogCardInfo>Filter table before clustering.</DialogCardInfo>
        </DialogCardLabel>

        <DialogCardContent>
          <VCenterRow className="gap-x-2">
            <Checkbox
              checked={settings.apps.kmeans.filterRows}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
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
              onNumChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.apps.kmeans.topRows = v
                })

                updateSettings(newSettings)
              }}
              className="w-20 rounded-theme"
            />
            <span className="shrink-0">rows using</span>
            <SelectList
              value={settings.apps.kmeans.rowFilterMethod}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.apps.kmeans.rowFilterMethod = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              className="w-32"
            >
              <SelectItem value="Stdev">Stdev</SelectItem>
              <SelectItem value="Mean">Mean</SelectItem>
              <SelectItem value="Median">Median</SelectItem>
            </SelectList>
          </VCenterRow>
        </DialogCardContent>

        <MenuSeparator />

        <DialogCardLabel title="Transform">
          <DialogCardInfo>Transform table before clustering.</DialogCardInfo>
        </DialogCardLabel>

        <DialogCardContent>
          <CheckPropRow
            title="Log2(data+1)"
            checked={settings.apps.kmeans.applyLog2}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.apps.kmeans.applyLog2 = v
              })

              updateSettings(newSettings)
            }}
          />

          <CheckPropRow
            title="Z-score"
            checked={settings.apps.kmeans.applyZscore}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.apps.kmeans.applyZscore = v
              })

              updateSettings(newSettings)
            }}
          />
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardLabel title="Cluster"></DialogCardLabel>

        <DialogCardContent>
          <PropRow title="K">
            <NumericalInput
              value={settings.apps.kmeans.clusters}
              limit={[0, 1000]}
              step={1}
              onNumChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.apps.kmeans.clusters = v
                })

                updateSettings(newSettings)
              }}
              className="w-16 rounded-theme"
            />
          </PropRow>

          <PropRow title="Distance">
            <SelectList
              value={settings.apps.kmeans.distance}
              onValueChange={(v) => {
                if (v) {
                  const newSettings = produce(settings, (draft) => {
                    draft.apps.kmeans.distance = v as string
                  })

                  updateSettings(newSettings)
                }
              }}
              className="w-40"
            >
              <SelectItem value="Correlation">Correlation</SelectItem>
              <SelectItem value="Euclidean">Euclidean</SelectItem>
            </SelectList>
          </PropRow>

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

          <CheckPropRow
            title="Sort by cluster"
            checked={settings.apps.kmeans.sortByCluster}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.apps.kmeans.sortByCluster = v
              })

              updateSettings(newSettings)
            }}
          />

          <CheckPropRow
            title="Show heatmap"
            checked={settings.apps.kmeans.showHeatmap}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.apps.kmeans.showHeatmap = v
              })

              updateSettings(newSettings)
            }}
          />
        </DialogCardContent>
      </DialogCard>
    </OKCancelDialog>
  )
}
