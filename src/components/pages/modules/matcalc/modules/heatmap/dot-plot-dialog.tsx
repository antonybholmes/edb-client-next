import {
  DEFAULT_HEATMAP_PROPS,
  DOT_PLOT_PERCENT_TABLE,
} from '@/components/plot/heatmap/heatmap-svg-props'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { Accordion } from '@components/shadcn/ui/themed/accordion'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'

import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import {
  getColIdxFromGroup,
  rowMean,
  rowZScore,
} from '@lib/dataframe/dataframe-utils'
import {
  HCluster,
  type IClusterFrame,
  type IClusterTree,
} from '@lib/math/hcluster'
import { HistoryContext, newPlot } from '@providers/history-provider'
import { useContext } from 'react'
import { GroupsContext } from '../../groups-provider'
import { MatcalcSettingsContext } from '../../matcalc-settings-provider'
import { MAX_CLUSTER_ITEMS } from './heatmap-dialog'

export interface IProps extends IModalProps {
  open?: boolean
  df: BaseDataFrame | null

  minThreshold?: number
}

export function DotPlotDialog({
  open = true,
  df,

  minThreshold = 0,

  onReponse,
}: IProps) {
  //const [zscore, setZscore] = useState(true)
  const { settings, updateSettings } = useContext(MatcalcSettingsContext)
  const { groupState } = useContext(GroupsContext)
  const { historyDispatch } = useContext(HistoryContext)

  function _resp(resp: string) {
    onReponse?.(resp)
  }

  function makeDotPlot() {
    if (!df) {
      _resp(TEXT_CANCEL)
      return
    }

    // get group means
    const means: number[][] = []
    const percents: number[][] = []

    groupState.order.forEach(id => {
      const group = groupState.groups.get(id)!
      const colIdx = getColIdxFromGroup(df, group)

      const dfg = df!.iloc(':', colIdx)
      means.push(rowMean(dfg))

      // percentage in each group
      const p: number[] = df!.rowMap(
        row =>
          (row as number[]).filter(x => x > minThreshold).length / row.length
      )

      percents.push(p)
    })

    const index = groupState.order.map(id => groupState.groups.get(id)!.name)
    // build group mean row centric then transpose
    const groupMeanDf = new DataFrame({
      name: 'Group means',
      data: means,
      index,
      columns: df.index,
    }).t()

    const groupPercentDf = new DataFrame({
      name: DOT_PLOT_PERCENT_TABLE,
      data: percents,
      index,
      columns: df.index,
    }).t()

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
      colC = hc.run(dfZ.t())
    }

    const cf: IClusterFrame = {
      rowTree: rowC,
      colTree: colC,
      df: dfZ,
      secondaryTables: { percent: groupPercentDf },
    }

    const plot = {
      ...newPlot('Dot Plot'),
      customProps: {
        cf,
        displayOptions: { ...DEFAULT_HEATMAP_PROPS },
      },
    }

    historyDispatch({ type: 'add-plots', plots: plot })

    _resp(TEXT_OK)

    //_resp(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Dot Plot"
      onReponse={r => {
        if (r === TEXT_CANCEL) {
          _resp(r)
        } else {
          makeDotPlot()
        }
      }}
      contentVariant="glass"
    >
      <Accordion
        type="multiple"
        value={['transform', 'cluster']}
        className="p-4 bg-background rounded-lg"
      >
        <SettingsAccordionItem title="Transform">
          <Checkbox
            checked={settings.heatmap.applyRowZscore}
            onCheckedChange={value => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, applyRowZscore: value },
              })
            }}
          >
            Z-score rows
          </Checkbox>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Cluster">
          <Checkbox
            checked={settings.heatmap.clusterRows}
            onCheckedChange={value => {
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
            onCheckedChange={value => {
              updateSettings({
                ...settings,
                heatmap: { ...settings.heatmap, clusterCols: value },
              })
            }}
          >
            Columns
          </Checkbox>
        </SettingsAccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
