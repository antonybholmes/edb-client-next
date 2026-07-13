import {
  DEFAULT_HEATMAP_PROPS,
  DOT_PLOT_PERCENT_TABLE,
  type DotPlotMode,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import {
  getColIdxFromGroup,
  log2,
  rowMean,
  rowZScore,
} from '@/lib/dataframe/dataframe-utils'
import {
  HCluster,
  type IClusterFrame,
  type IClusterTree,
} from '@/lib/math/hcluster'
import { useEffect, useState } from 'react'

import { WarningIcon } from '@/components/icons/warning-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { cumulativeSteps } from '@/lib/math/quartile'
import { formatNumber } from '@/lib/text/text'
import { produce } from 'immer'

import { getTabName, useTabs } from '@/components/tabs/tab-provider'

import {
  DialogCard,
  DialogCardContent,
  DialogCardHeader,
  DialogCardInfo,
} from '@/components/dialogs/card/dialog-card'
import { SafariTabs } from '@/components/tabs/safari-tabs'
import { useStableId } from '@/hooks/stable-id'
import { Group, PencilRuler } from 'lucide-react'
import {
  useCurrentGroups,
  useCurrentSheets,
} from '../../history/history-provider/history-contexts'
import { newHeatMapPlot } from '../../history/history-provider/history-factories'
import { HistoryPlot } from '../../history/history-provider/history-types'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { MAX_CLUSTER_ITEMS, MAX_HEATMAP_DIM } from './heatmap-dialog'

const TABS = [
  { id: 'size', name: 'Size', icon: <PencilRuler size={16} strokeWidth={3} /> },
  { id: 'groups', name: 'Groups', icon: <Group size={16} strokeWidth={3} /> },
]

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean
  isClusterMap?: boolean | undefined
  minThreshold?: number
}

export function DotPlotDialog({
  open = true,
  isClusterMap = false,
  minThreshold = 0,
  onResponse,
}: IProps) {
  const tabsId = useStableId('matcalc-dot-plot')
  //const [zscore, setZscore] = useState(true)
  const { settings, updateSettings } = useMatcalcSettings()

  const [error, setError] = useState('')

  const { sheets } = useCurrentSheets()
  const { groups } = useCurrentGroups()

  const { selectedTab, setTabs } = useTabs(tabsId)

  useEffect(() => {
    setTabs(TABS.map((t) => ({ ...t })))
  }, [setTabs])

  useEffect(() => {
    // In cluster mode, force column clustering
    if (isClusterMap) {
      updateSettings({
        ...settings,
        heatmap: { ...settings.heatmap, clusterCols: isClusterMap },
      })
    }
  }, [isClusterMap])

  function makeDotPlot() {
    if ((sheets[0] as BaseDataFrame).shape[0] > MAX_HEATMAP_DIM) {
      setError(
        `You can plot up to ${MAX_HEATMAP_DIM.toLocaleString()} rows. Please reduce the number of rows in your table.`
      )
      return
    }

    if (selectedTab?.id === 'groups') {
      makeGroupDotPlot()
    } else {
      makeSizeDotPlot()
    }
  }

  function makeGroupDotPlot() {
    if (groups.length === 0) {
      setError('You must create some groups. Exit this dialog to do so.')
      return
    }

    const df = sheets[0] as BaseDataFrame

    // get group means
    const means: number[][] = []
    const percents: number[][] = []
    const groupsToPlot = groups.filter(
      (g) => g.show || settings.groups.filter.mode === 'keep'
    )

    for (const group of groupsToPlot) {
      const colIdx = getColIdxFromGroup(df, group)

      const dfg = df.iloc({ cols: colIdx }) as BaseDataFrame
      means.push(rowMean(dfg))

      // percentage in each group
      const p: number[] = df.rowMap(
        (row) =>
          (row as number[]).filter((x) => x > minThreshold).length / row.length
      )

      percents.push(p)
    }

    const index = groupsToPlot.map((g) => g.name)

    // build group mean row centric then transpose
    const groupMeanDf = new AnnotationDataFrame({
      name: 'Group means',
      data: means,
      index,
      columns: (sheets[0] as BaseDataFrame).index,
    }).t

    const groupPercentDf = new AnnotationDataFrame({
      name: DOT_PLOT_PERCENT_TABLE,
      data: percents,
      index,
      columns: (sheets[0] as BaseDataFrame).index,
    }).t

    // historyDispatch({
    //   type: 'add-step',
    //   description: 'Dot stats',
    //   sheets: [groupMeanDf, groupPercentDf],
    // })

    const dfZ = settings.heatmap.applyRowZscore
      ? rowZScore(groupMeanDf)
      : groupMeanDf

    if (!dfZ) {
      onResponse?.(TEXT_CANCEL, undefined)
      return
    }

    const hc = new HCluster()

    let rowC: IClusterTree | undefined = undefined
    let colC: IClusterTree | undefined = undefined

    if (settings.heatmap.clusterRows && dfZ.shape[0] < MAX_CLUSTER_ITEMS) {
      rowC = hc.run(dfZ)
    }

    if (settings.heatmap.clusterCols && dfZ.shape[1] < MAX_CLUSTER_ITEMS) {
      colC = hc.run(dfZ.t)
    }

    const cf: IClusterFrame = {
      id: makeUuid(),
      name: 'Dot Plot Cluster Frame',
      rowTree: rowC,
      colTree: colC,
      df: dfZ as AnnotationDataFrame,
      //secondaryTables: { percent: groupPercentDf },
    }

    const displayOptions: IHeatMapDisplayOptions = {
      ...DEFAULT_HEATMAP_PROPS,
      mode: 'dot',
    }

    const plot: HistoryPlot = newHeatMapPlot(
      'Dot Plot',
      { main: cf, size: groupPercentDf },
      {
        style: 'dot',
        props: displayOptions,
      }
    )

    //addPlots([plot])

    onResponse?.(TEXT_OK, plot)

    //_resp(TEXT_OK)
  }

  function makeSizeDotPlot() {
    // get group means

    // historyDispatch({
    //   type: 'add-step',
    //   description: 'Dot stats',
    //   sheets: [groupMeanDf, groupPercentDf],
    // })

    // make some sizes for the balls

    // want 4 points equally spaced within range but not covering the
    //extremes

    const df = sheets[0] as BaseDataFrame

    const dfLog = settings.heatmap.applyLog2 ? log2(df, 1) : df

    // based sizes on log data
    let min = dfLog.min()
    let max = dfLog.max()
    let range = max - min

    const size = dfLog.map((v) => ((v as number) - min) / range)

    const sizeDf = new AnnotationDataFrame({
      name: 'Size',
      data: size,
      index: df.index,
      columns: df.columns,
    })

    // now z-score

    const dfZ = settings.heatmap.applyRowZscore ? rowZScore(dfLog) : dfLog

    if (!dfZ) {
      onResponse?.(TEXT_CANCEL, undefined)
      return
    }

    // Sizes for legend are based on unadjusted matrix

    min = dfLog!.min()
    max = dfLog!.max()
    range = max - min

    let sizes = cumulativeSteps(range, 4).map((s) => s + min)
    //.slice(0, 4)

    // if data is logged, but user wants to see
    // original values for sizes, then convert back
    if (
      settings.dot.size.useOriginalValuesForSizes &&
      settings.heatmap.applyLog2
    ) {
      sizes = sizes.map((s) => Math.round(Math.pow(2, s)))
    }

    const hc = new HCluster()

    let rowC: IClusterTree | undefined = undefined
    let colC: IClusterTree | undefined = undefined

    if (settings.heatmap.clusterRows && dfZ.shape[0] < MAX_CLUSTER_ITEMS) {
      rowC = hc.run(dfZ)
    }

    if (settings.heatmap.clusterCols && dfZ.shape[1] < MAX_CLUSTER_ITEMS) {
      colC = hc.run(dfZ.t)
    }

    const cf: IClusterFrame = {
      id: makeUuid(),
      name: 'Dot Plot Cluster Frame',
      rowTree: rowC,
      colTree: colC,
      df: dfZ as AnnotationDataFrame,
      //secondaryTables: { percent: groupPercentDf },
    }

    const displayOptions: IHeatMapDisplayOptions = {
      ...DEFAULT_HEATMAP_PROPS,
      mode: 'dot',
      dot: {
        ...DEFAULT_HEATMAP_PROPS.dot,
        useOriginalValuesForSizes: settings.dot.size.useOriginalValuesForSizes,
        mode: getTabName(selectedTab) as DotPlotMode,
        sizes: sizes.map((s, si) => ({
          size: (si + 1) / 4,
          value: formatNumber(s, { dp: DEFAULT_HEATMAP_PROPS.cells.values.dp }),
        })),
        //sizes: sizes.map(s => ({ size: s, value: s })),
        lim: [min, max],
      },
    }

    const plot: HistoryPlot = newHeatMapPlot(
      'Dot Plot',
      { main: cf, raw: df, size: sizeDf },
      {
        style: 'dot',
        groups,
        props: displayOptions,
      }
    )

    //addPlots([plot])

    onResponse?.(TEXT_OK, plot)

    //_resp(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Dot Plot"
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r)
        } else {
          makeDotPlot()
        }
      }}
      bodyCls="gap-y-2"
      className="h-110"
      centerHeaderChildren={<SafariTabs id={tabsId} defaultWidth={4} />}
    >
      {error && (
        <VCenterRow className="text-destructive gap-x-2 rounded-theme p-2 bg-destructive/10">
          <WarningIcon stroke="stroke-destructive" size="w-5" />
          <span>{error}</span>
        </VCenterRow>
      )}

      {selectedTab?.id === 'size' && (
        <VCenterRow className="gap-x-1">
          <CheckPropRow
            title="Use original data for sizes"
            checked={settings.dot.size.useOriginalValuesForSizes}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.dot.size.useOriginalValuesForSizes = v
              })

              updateSettings(newSettings)
            }}
          />
          <InfoHoverCard>
            Label dot sizes with original data values. This is useful if you do
            not want to interpret log values.
          </InfoHoverCard>
        </VCenterRow>
      )}

      <DialogCardHeader title="Transform"></DialogCardHeader>

      <DialogCard>
        <DialogCardInfo>
          Modify data before plotting for improved contrast.
        </DialogCardInfo>

        <DialogCardContent>
          <CheckPropRow
            title="Log2(data + 1)"
            checked={settings.heatmap.applyLog2}
            onCheckedChange={(value) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.applyLog2 = value
              })

              updateSettings(newSettings)
            }}
          />

          <CheckPropRow
            title="Z-score rows"
            checked={settings.heatmap.applyRowZscore}
            onCheckedChange={(value) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.applyRowZscore = value
              })

              updateSettings(newSettings)
            }}
          />
        </DialogCardContent>
      </DialogCard>

      <DialogCardHeader title="Cluster"></DialogCardHeader>
      <DialogCard>
        <DialogCardInfo>
          Apply hierarchical row/column clustering.
        </DialogCardInfo>
        <DialogCardContent>
          <CheckPropRow
            title="Rows"
            checked={settings.heatmap.clusterRows}
            onCheckedChange={(value) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.clusterRows = value
              })

              updateSettings(newSettings)
            }}
          />

          <CheckPropRow
            title="Columns"
            checked={settings.heatmap.clusterCols}
            onCheckedChange={(value) => {
              const newSettings = produce(settings, (draft) => {
                draft.heatmap.clusterCols = value
              })

              updateSettings(newSettings)
            }}
          />
        </DialogCardContent>
      </DialogCard>
    </OKCancelDialog>
  )
}
