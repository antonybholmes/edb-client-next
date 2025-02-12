import type { IDim } from '@/interfaces/dim'
import { BWR_CMAP, type ColorMap } from '@/lib/colormap'

import type { LeftRightPos } from '@/components/side'
import { COLOR_BLACK } from '@/consts'
import type { ILim } from '../axis'
import {
  DEFAULT_STROKE_PROPS,
  type ColorBarPos,
  type ILabelProps,
  type IStrokeProps,
  type LegendPos,
  type TopBottomPos,
} from '../svg-props'

export interface IBlock {
  w: number
  h: number
}

export const DOT_PLOT_PERCENT_TABLE = 'Group percentages'

export const DEFAULT_COLORBAR_SIZE: IDim = { width: 160, height: 16 }

export const LEGEND_BLOCK_SIZE: IBlock = { w: 20, h: 20 }

const BLOCK_SIZE: IBlock = { w: 24, h: 24 }

const GROUPS_SIZE: IBlock = { w: 24, h: 16 }

export const MIN_INNER_HEIGHT: number = 200

// interface IGridProps {
//   show: boolean

//   stroke: IStrokeProps
// }

export interface ITreeProps {
  show: boolean
  width: number
  stroke: IStrokeProps
}

export const DEFAULT_TREE_PROPS: ITreeProps = {
  show: true,
  width: 100,
  stroke: { ...DEFAULT_STROKE_PROPS },
}

export interface IHeatMapDisplayOptions {
  //margin: { top: number; right: number; bottom: number; left: number }
  blockSize: IBlock
  grid: IStrokeProps
  border: IStrokeProps
  style: 'Square' | 'Dot'
  range: ILim
  rowLabels: ILabelProps & {
    position: LeftRightPos
  }
  colLabels: ILabelProps & {
    position: TopBottomPos
    isColored: boolean
  }
  colorbar: {
    show: boolean
    size: IDim
    width: number
    position: ColorBarPos
    stroke: IStrokeProps
  }
  rowTree: ITreeProps & {
    position: LeftRightPos
  }
  colTree: ITreeProps & {
    position: TopBottomPos
  }
  legend: {
    show: boolean
    position: LegendPos
    width: number
    stroke: IStrokeProps
  }
  dotLegend: {
    sizes: number[]
    lim: ILim
    type: string
  }
  groups: {
    keepUnused: boolean
    show: boolean
    height: number
    grid: IStrokeProps
    border: IStrokeProps
  }
  padding: number
  scale: number
  cmap: ColorMap
}

export const DEFAULT_HEATMAP_PROPS: IHeatMapDisplayOptions = {
  //margin: { top: 20, right: 20, bottom: 20, left: 20 },
  blockSize: BLOCK_SIZE,
  grid: { ...DEFAULT_STROKE_PROPS, color: '#EEEEEE' },
  border: { ...DEFAULT_STROKE_PROPS },
  range: [-3, 3],
  style: 'Square',
  rowLabels: {
    position: 'Right',
    width: 150,
    show: true,
    color: COLOR_BLACK,
  },
  colLabels: {
    position: 'Top',
    width: 150,
    isColored: true,
    show: true,
    color: COLOR_BLACK,
  },
  colorbar: {
    position: 'Right',
    size: { ...DEFAULT_COLORBAR_SIZE },
    width: 100,
    show: true,
    stroke: { ...DEFAULT_STROKE_PROPS },
  },
  groups: {
    show: true,
    height: GROUPS_SIZE.h,
    keepUnused: false,
    border: { ...DEFAULT_STROKE_PROPS },
    grid: { ...DEFAULT_STROKE_PROPS, show: false },
  },
  legend: {
    position: 'Upper Right',
    width: 200,
    show: true,
    stroke: { ...DEFAULT_STROKE_PROPS },
  },
  dotLegend: {
    sizes: [25, 50, 75, 100],
    lim: [0, 100],
    type: '%',
  },
  rowTree: { ...DEFAULT_TREE_PROPS, position: 'Left' },
  colTree: {
    ...DEFAULT_TREE_PROPS,
    position: 'Top',
  },
  padding: 10,
  scale: 1,
  cmap: BWR_CMAP,
}
