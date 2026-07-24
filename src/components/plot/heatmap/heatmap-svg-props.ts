import type { IDim } from '@/interfaces/dim'
import { COLOR_MAPS } from '@/lib/color/colormap'

import type { LeftRightPos } from '@/components/side'
import { COLOR_BLACK } from '@/lib/color/color'

import type { ILim } from '@/lib/math/math'
import {
  DEFAULT_BOLD_FONT_PROPS,
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_FONT_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type ColorBarPos,
  type IFontProps,
  type ILabelProps,
  type IStrokeProps,
  type ITextProps,
  type LegendPos,
  type TopBottomPos,
} from '../svg-props'

export interface IBlock {
  w: number
  h: number
}

export const DOT_PLOT_PERCENT_TABLE = 'Group percentages'

export const DEFAULT_COLORBAR_SIZE: IDim = { w: 160, h: 14 }

export const LEGEND_BLOCK_SIZE: IBlock = { w: 20, h: 20 }

const BLOCK_SIZE: IBlock = { w: 24, h: 24 }

const GROUPS_SIZE: IBlock = { w: 24, h: 16 }

export const MIN_INNER_HEIGHT: number = 200

export type DotPlotMode = 'groups' | 'size'

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

export type HeatmapMode = 'heatmap' | 'dot'

export interface IHeatMapDisplayOptions {
  title: ITextProps & { text: string; offset: number }
  cells: {
    values: {
      color: string
      autoColor: {
        on: boolean
        threshold: number
      }
      dp: number
      show: boolean
      filter: {
        on: boolean
        value: number
      }
    }
    border: IStrokeProps
  }
  actions: {
    show: boolean
  }
  //margin: IMarginProps
  blockSize: IBlock
  grid: IStrokeProps
  border: IStrokeProps
  mode: HeatmapMode
  range: ILim
  rowLabels: ILabelProps & {
    position: LeftRightPos
    showMetadata: boolean
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
    font: IFontProps
    position: LegendPos
    width: number
    stroke: IStrokeProps
    title: ITextProps & {
      text: string
    }
    icon: {
      shape: 's' | 'c' | 'l'
      size: number
    }
  }
  dot: {
    sizes: { size: number; value: number | string }[]
    lim: ILim
    mode: DotPlotMode
    useOriginalValuesForSizes: boolean
    legend: {
      show: boolean
      title: {
        show: boolean
        text: string
      }
    }
  }
  groups: {
    keepUnused: boolean
    show: boolean
    height: number
    grid: IStrokeProps
    border: IStrokeProps
    labels: ITextProps
  }
  padding: number
  zoom: number
  cmap: keyof typeof COLOR_MAPS
  tooltip: {
    show: boolean
  }
}

export const DEFAULT_HEATMAP_PROPS: IHeatMapDisplayOptions = {
  //margin: { top: 20, right: 20, bottom: 20, left: 20 },
  blockSize: BLOCK_SIZE,
  grid: {
    ...DEFAULT_STROKE_PROPS,
    value: '#EEEEEE',
  },
  border: { ...DEFAULT_STROKE_PROPS },
  range: [-2, 2],
  mode: 'heatmap',
  title: { ...DEFAULT_BOLD_TEXT_PROPS, text: '', offset: 20 },
  actions: { show: true },
  rowLabels: {
    ...DEFAULT_TEXT_PROPS,
    position: 'right',
    width: 120,
    showMetadata: true,
  },
  colLabels: {
    ...DEFAULT_TEXT_PROPS,
    position: 'top',
    width: 150,
    isColored: true,
  },
  colorbar: {
    position: 'right',
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
    grid: {
      ...DEFAULT_STROKE_PROPS,
      show: false,
    },
    labels: { ...DEFAULT_TEXT_PROPS },
  },
  legend: {
    position: 'upper-right',
    width: 200,
    show: true,
    stroke: { ...DEFAULT_STROKE_PROPS },
    title: {
      show: true,
      text: 'Groups',
      font: { ...DEFAULT_BOLD_FONT_PROPS },
    },
    font: { ...DEFAULT_FONT_PROPS },
    icon: {
      shape: 's',
      size: 16,
    },
  },
  dot: {
    sizes: [
      { size: 0.25, value: '25%' },
      { size: 0.5, value: '50%' },
      { size: 0.75, value: '75%' },
      { size: 1, value: '100%' },
    ],
    lim: [0, 100],
    mode: 'groups',
    legend: {
      show: true,
      title: {
        show: true,
        text: 'Dot Size',
      },
    },
    useOriginalValuesForSizes: true,
  },
  rowTree: { ...DEFAULT_TREE_PROPS, position: 'left' },
  colTree: {
    ...DEFAULT_TREE_PROPS,
    position: 'top',
  },
  padding: 10,
  zoom: 1,
  cmap: 'BWR v2',
  cells: {
    values: {
      show: false,
      dp: 1,
      filter: {
        on: false,
        value: 1,
      },

      color: COLOR_BLACK,
      autoColor: {
        on: true,
        threshold: 150,
      },
    },
    border: {
      ...DEFAULT_STROKE_PROPS,
      show: false,
    },
  },
  tooltip: {
    show: true,
  },
}
