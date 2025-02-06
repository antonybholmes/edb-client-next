import { VCenterRow } from '@/components/layout/v-center-row'
import { dfMean } from '@/components/table/dataframe-ui'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  HCluster,
  averageLinkage,
  singleLinkage,
  type IClusterFrame,
  type IClusterTree,
  type IDistFunc,
  type ILinkage,
} from '@lib/math/hcluster'
import { HistoryContext, newPlot } from '@providers/history-provider'
import { useContext, useEffect, useState } from 'react'

import { Input } from '@components/shadcn/ui/themed/input'
import { SelectItem, SelectList } from '@components/shadcn/ui/themed/select'

import {
  euclidean as euclideanDist,
  pearsond as pearsonDist,
} from '@lib/math/distance'

import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { DEFAULT_HEATMAP_PROPS } from '@/components/plot/heatmap/heatmap-svg-props'
import {
  log,
  meanFilter,
  medianFilter,
  rowZScore,
  stdevFilter,
} from '@/lib/dataframe/dataframe-utils'
import { Accordion } from '@components/shadcn/ui/themed/accordion'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { MatcalcSettingsContext } from '../../matcalc-settings-provider'

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
  open?: boolean
  df: BaseDataFrame | null
  isClusterMap?: boolean
}

export function HeatMapDialog({
  open = true,
  df,
  isClusterMap = false,
  onReponse,
}: IProps) {
  //const [linkage, setLinkage] = useState("Average")
  //const [distanceMetric, setDistanceMetric] = useState("Correlation")

  //const [topRows, setTopRows] = useState(1000)
  const [error, setError] = useState('')

  const { settings, updateSettings } = useContext(MatcalcSettingsContext)
  const { historyDispatch } = useContext(HistoryContext)

  //console.log(settings)

  useEffect(() => {
    // In cluster mode, force column clustering
    if (isClusterMap) {
      updateSettings({
        ...settings,
        heatmap: { ...settings.heatmap, clusterCols: isClusterMap },
      })
    }
  }, [isClusterMap])

  function makeCluster() {
    if (!df) {
      onReponse?.(TEXT_CANCEL)
      return
    }

    if (settings.heatmap.filterRows) {
      switch (settings.heatmap.rowFilterMethod) {
        case 'Mean':
          dfMean(df, historyDispatch)

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
        onReponse?.(TEXT_CANCEL)
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
      df = df!.t() //dfTranspose(df, historyDispatch)
    }

    if (!df) {
      onReponse?.(TEXT_CANCEL)
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
      colC = hc.run(df.t())
    }

    const cf: IClusterFrame = {
      rowTree: rowC,
      colTree: colC,
      df,
    }

    const plot = {
      ...newPlot('Heatmap'),
      customProps: {
        cf,
        displayOptions: { ...DEFAULT_HEATMAP_PROPS },
      },
    }

    historyDispatch({ type: 'add-plots', plots: plot })

    onReponse?.(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Heatmap"
      onReponse={(r) => {
        if (r === TEXT_CANCEL) {
          onReponse?.(r)
        } else {
          makeCluster()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 3xl:w-1/4"
      contentVariant="glass"
    >
      {error && <span className="text-destructive">{error}</span>}
      <Accordion
        type="multiple"
        defaultValue={['filter', 'transform', 'cluster']}
        className="bg-background rounded-lg p-4"
      >
        <SettingsAccordionItem title="Filter">
          <VCenterRow className="gap-x-2">
            <Checkbox
              checked={settings.heatmap.filterRows}
              onCheckedChange={(value) => {
                updateSettings({
                  ...settings,
                  heatmap: { ...settings.heatmap, filterRows: value },
                })
              }}
            />
            <span>Top</span>
            <Input
              id="top-rows"
              value={settings.heatmap.topRows.toString()}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value)

                if (Number.isInteger(v)) {
                  updateSettings({
                    ...settings,
                    heatmap: { ...settings.heatmap, topRows: v },
                  })
                }
              }}
              className="w-20 rounded-theme"
            />
            <span className="shrink-0">rows using</span>
            <SelectList
              value={settings.heatmap.rowFilterMethod}
              onValueChange={(value) =>
                updateSettings({
                  ...settings,
                  heatmap: { ...settings.heatmap, rowFilterMethod: value },
                })
              }
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
            onCheckedChange={(value) => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, applyLog2: value },
              })
            }}
          >
            Log2(data+1)
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.applyRowZscore}
            onCheckedChange={(value) => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, applyRowZscore: value },
              })
            }}
          >
            Z-score rows
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.applyTranspose}
            onCheckedChange={(value) => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, applyTranspose: value },
              })
            }}
          >
            Transpose
          </Checkbox>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Cluster">
          <Checkbox
            checked={settings.heatmap.clusterRows}
            onCheckedChange={(value) => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, clusterRows: value },
              })
            }}
          >
            Rows
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.clusterCols}
            onCheckedChange={(value) => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, clusterCols: value },
              })
            }}
          >
            Columns
          </Checkbox>

          <VCenterRow>
            <span className="w-24">Linkage</span>
            <SelectList
              value={settings.heatmap.linkage}
              onValueChange={(value) => {
                updateSettings({
                  ...settings,
                  heatmap: { ...settings.heatmap, linkage: value },
                })
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
              onValueChange={(value) => {
                updateSettings({
                  ...settings,
                  heatmap: { ...settings.heatmap, distance: value },
                })
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
