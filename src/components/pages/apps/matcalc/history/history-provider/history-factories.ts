import { DEFAULT_HEATMAP_PROPS } from '@/components/plot/heatmap/heatmap-svg-props'
import { IDBEntity } from '@/interfaces/db-entity'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { makeUuid } from '@/lib/id'
import { produce } from 'immer'
import { DEFAULT_BOX_PLOT_DISPLAY_PROPS } from '../../apps/boxplot/boxplot-plot-svg'
import { DEFAULT_EXT_GSEA_PROPS } from '../../apps/ext-gsea/ext-gsea-store'
import { DEFAULT_VOLCANO_PROPS } from '../../apps/volcano/volcano-plot-svg'
import {
  BoxPlot,
  DataFrameType,
  ExtGseaPlot,
  HeatMapPlot,
  IHistoryApp,
  VolcanoPlot,
} from './history-types'

export function newHeatMapPlot(
  name: string,
  dataframes: Record<string, DataFrameType> = {},
  opts: Partial<HeatMapPlot> = {}
): HeatMapPlot {
  const {
    style = 'heatmap',
    props = { ...DEFAULT_HEATMAP_PROPS },
    actions = [],
    groups = [],
  } = opts

  return {
    id: makeUuid(),
    style,
    name,
    dataframes,
    groups,
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export function newBoxPlot(
  name: string,
  dataframes: Record<string, BaseDataFrame> = {},
  opts: Partial<BoxPlot> = {}
): BoxPlot {
  const {
    style = 'box',
    props = { ...DEFAULT_BOX_PLOT_DISPLAY_PROPS },
    actions = [],
    groups = [],
    x = '',
    y = '',
    hue = '',
    xOrder = [],
    hueOrder = [],
    singlePlotDisplayOptions = {},
  } = opts

  return {
    id: makeUuid(),

    style,
    name,
    dataframes,
    groups,
    props,
    actions,
    x,
    y,
    hue,
    xOrder,
    hueOrder,
    singlePlotDisplayOptions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export function newVolcanoPlot(
  name: string,
  dataframes: Record<string, BaseDataFrame> = {},

  opts: Partial<VolcanoPlot> = {}
): VolcanoPlot {
  const {
    style = 'volcano',
    props = { ...DEFAULT_VOLCANO_PROPS },
    actions = [],
    groups = [],
  } = opts

  return {
    id: makeUuid(),
    ////path: '',
    style,
    name,
    dataframes,
    groups,
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export function newExtGseaPlot(
  name: string,

  opts: Partial<ExtGseaPlot> = {}
): ExtGseaPlot {
  const {
    actions = [],
    groups = [],
    extGseaRes = {} as IExtGseaResult,
    gseaRes1 = {} as IGseaResult,
    gseaRes2 = {} as IGseaResult,
    rankedGenes = {} as IRankedGenes,
    gs1 = {} as IGeneSet,
    gs2 = {} as IGeneSet,
    props = { ...DEFAULT_EXT_GSEA_PROPS },
  } = opts

  return {
    id: makeUuid(),
    //path: '',
    style: 'ext-gsea',
    name,
    //dataframes,
    groups,
    extGseaRes,
    gseaRes1,
    gseaRes2,
    rankedGenes,
    gs1,
    gs2,
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export interface IHistoryFileDesc {
  app: string
  file: string
  node: string
  type: 'app' | 'file' | 'sheet' | 'plot'
}

export function newHistoryFile(name: string): IDBEntity {
  return {
    id: makeUuid(),
    name,
    createdAt: new Date().toISOString(),
  }
}

export function cloneHistory(history: IHistoryApp): IHistoryApp {
  return produce(history, () => {})
}
