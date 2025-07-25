import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import {
  DEFAULT_HEATMAP_PROPS,
  DOT_PLOT_PERCENT_TABLE,
  type DotPlotMode,
  type IHeatMapDisplayOptions,
} from '@components/plot/heatmap/heatmap-svg-props'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import { Accordion } from '@themed/accordion'
import { Checkbox } from '@themed/check-box'

import { SettingsAccordionItem } from '@dialog/settings/settings-dialog'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import {
  getColIdxFromGroup,
  log2,
  rowMean,
  rowZScore,
} from '@lib/dataframe/dataframe-utils'
import {
  HCluster,
  type IClusterFrame,
  type IClusterTree,
} from '@lib/math/hcluster'
import { useEffect, useState } from 'react'

import { CheckPropRow } from '@/components/dialog/check-prop-row'
import { HCenterRow } from '@/components/layout/h-center-row'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/hover-card'
import { WarningIcon } from '@components/icons/warning-icon'
import { VCenterRow } from '@components/layout/v-center-row'
import { Tabs } from '@components/shadcn/ui/themed/tabs'
import { IOSTabsList } from '@components/tabs/ios-tabs'
import { cumulativeSteps } from '@lib/math/quartile'
import { produce } from 'immer'
import { newPlot, useHistory, type IPlot } from '../../history/history-store'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { MAX_CLUSTER_ITEMS } from './heatmap-dialog'

export interface IProps extends IModalProps {
  open?: boolean
  isClusterMap?: boolean
  minThreshold?: number
}

export function DotPlotDialog({
  open = true,
  isClusterMap = false,
  minThreshold = 0,
  onResponse,
}: IProps) {
  //const [zscore, setZscore] = useState(true)
  const { settings, updateSettings } = useMatcalcSettings()
  const [dotplotMode, setDotPlotMode] = useState<DotPlotMode>('size')
  const [error, setError] = useState('')
  const { sheet, addPlots, groups } = useHistory()

  useEffect(() => {
    // In cluster mode, force column clustering
    if (isClusterMap) {
      updateSettings({
        ...settings,
        heatmap: { ...settings.heatmap, clusterCols: isClusterMap },
      })
    }
  }, [isClusterMap])

  function _resp(resp: string) {
    onResponse?.(resp)
  }

  function makeDotPlot() {
    if (!sheet) {
      _resp(TEXT_CANCEL)
      return
    }

    if (dotplotMode === 'groups') {
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

    // get group means
    const means: number[][] = []
    const percents: number[][] = []

    for (const group of groups) {
      const colIdx = getColIdxFromGroup(sheet!, group)

      const dfg = sheet!.iloc(':', colIdx)
      means.push(rowMean(dfg))

      // percentage in each group
      const p: number[] = sheet!.rowMap(
        row =>
          (row as number[]).filter(x => x > minThreshold).length / row.length
      )

      percents.push(p)
    }

    const index = groups.map(g => g.name)
    // build group mean row centric then transpose
    const groupMeanDf = new AnnotationDataFrame({
      name: 'Group means',
      data: means,
      index,
      columns: sheet!.index,
    }).t

    const groupPercentDf = new AnnotationDataFrame({
      name: DOT_PLOT_PERCENT_TABLE,
      data: percents,
      index,
      columns: sheet!.index,
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
      _resp(TEXT_CANCEL)
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
      rowTree: rowC,
      colTree: colC,
      df: dfZ as AnnotationDataFrame,
      //secondaryTables: { percent: groupPercentDf },
    }

    const displayOptions: IHeatMapDisplayOptions = {
      ...DEFAULT_HEATMAP_PROPS,
      mode: 'dot',
    }

    const plot: IPlot = {
      ...newPlot('Dot Plot', { main: cf, size: groupPercentDf }, 'dot'),
      customProps: {
        displayOptions,
      },
    }

    addPlots([plot])

    _resp(TEXT_OK)

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

    const dfLog = settings.heatmap.applyLog2 ? log2(sheet!, 1) : sheet!

    // based sizes on log data
    let min = dfLog.min()
    let max = dfLog.max()
    let range = max - min

    const size = dfLog.map(v => ((v as number) - min) / range)

    const sizeDf = new AnnotationDataFrame({
      name: 'Size',
      data: size,
      index: sheet!.index,
      columns: sheet!.colNames,
    })

    // now z-score

    const dfZ = settings.heatmap.applyRowZscore ? rowZScore(dfLog) : dfLog

    if (!dfZ) {
      _resp(TEXT_CANCEL)
      return
    }

    // Sizes for legend are based on unadjusted matrix

    if (settings.dot.size.useOriginalValuesForSizes) {
      min = sheet!.min()
      max = sheet!.max()
      range = max - min
    } else {
      min = dfLog!.min()
      max = dfLog!.max()
      range = max - min
    }

    const sizes = cumulativeSteps(range, 5)
      .map(s => s + min)
      .slice(0, 4)

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
        mode: dotplotMode,
        sizes,
        lim: [min, max],
      },
    }

    const plot: IPlot = {
      ...newPlot('Dot Plot', { main: cf, raw: sheet!, size: sizeDf }, 'dot'),
      groups,
      customProps: {
        displayOptions,
      },
    }

    addPlots([plot])

    _resp(TEXT_OK)

    //_resp(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Dot Plot"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          _resp(r)
        } else {
          makeDotPlot()
        }
      }}
      //contentVariant="glass"
    >
      {error && (
        <VCenterRow className="text-destructive gap-x-2  rounded-theme p-2 bg-destructive/10">
          <WarningIcon stroke="stroke-destructive" w="w-5" />
          <span>{error}</span>
        </VCenterRow>
      )}

      <HCenterRow>
        <Tabs
          defaultValue={dotplotMode}
          value={dotplotMode}
          onValueChange={v => setDotPlotMode(v as DotPlotMode)}
        >
          <IOSTabsList
            value={dotplotMode}
            defaultWidth="80px"
            tabs={[
              { id: 'size', name: 'Size' },
              { id: 'groups', name: 'Groups' },
            ]}
          />
        </Tabs>
      </HCenterRow>

      {dotplotMode === 'size' && (
        <VCenterRow className="gap-x-1">
          <CheckPropRow
            title="Use original data for sizes"
            checked={settings.dot.size.useOriginalValuesForSizes}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.dot.size.useOriginalValuesForSizes = v
              })

              updateSettings(newSettings)
            }}
          />
          <InfoHoverCard title="Use original data for sizes">
            <p>
              Show the original data in the dot plot sizes. This is useful if
              you do not want to interpret log values.
            </p>
          </InfoHoverCard>
        </VCenterRow>
      )}

      <Accordion
        type="multiple"
        defaultValue={['transform', 'cluster']}
        //className="p-4 bg-background rounded-lg"
      >
        <SettingsAccordionItem title="Transform">
          <Checkbox
            checked={settings.heatmap.applyLog2}
            onCheckedChange={value => {
              const newSettings = produce(settings, draft => {
                draft.heatmap.applyLog2 = value
              })

              updateSettings(newSettings)
            }}
          >
            Log2(data + 1)
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.applyRowZscore}
            onCheckedChange={value => {
              const newSettings = produce(settings, draft => {
                draft.heatmap.applyRowZscore = value
              })

              updateSettings(newSettings)
            }}
          >
            Z-score rows
          </Checkbox>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Cluster">
          <Checkbox
            checked={settings.heatmap.clusterRows}
            onCheckedChange={value => {
              const newSettings = produce(settings, draft => {
                draft.heatmap.clusterRows = value
              })

              updateSettings(newSettings)
            }}
          >
            Rows
          </Checkbox>

          <Checkbox
            checked={settings.heatmap.clusterCols}
            onCheckedChange={value => {
              const newSettings = produce(settings, draft => {
                draft.heatmap.clusterCols = value
              })

              updateSettings(newSettings)
            }}
          >
            Columns
          </Checkbox>
        </SettingsAccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
