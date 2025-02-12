import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  NO_STROKE_PROPS,
  type IFillProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { COLOR_RED, COLOR_WHITE } from '@/consts'
import type { IMannWhitneyUResult } from '@lib/math/mann-whitney'

export interface IGexValueType {
  id: number
  name: 'Counts' | 'TPM' | 'VST' | 'RMA'
}

export interface IGexPlatform {
  id: number
  name: 'RNA-seq' | 'Microarray'
  gexValueTypes: IGexValueType[]
}

export interface IGexGene {
  id: number
  geneId: string
  geneSymbol: string
}

export interface IGexSample {
  id: number
  name: string
  coo: string
  lymphgen: string
}

export interface IGexDataset {
  id: number // a uuid to uniquely identify the database
  name: string // a human readable name for the database
  institution: string // a public id for the database

  samples: IGexSample[]

  displayProps: IGexPlotDisplayProps
}

export interface IGexResultSample {
  id: number
  //counts: number
  //tpm: number
  //vst: number
  value: number
}

export interface IGexResultDataset {
  id: number
  //samples: IGexResultSample[]
  values: number[]
}

export interface IGexResultGene {
  gene: IGexGene
  //platform: IGexPlatform
  //gexValueType: IGexValueType
  datasets: IGexResultDataset[]
}

export interface IGexSearchResults {
  platform: IGexPlatform
  gexValueType: IGexValueType
  genes: IGexResultGene[]
}

export interface IGexStats extends IMannWhitneyUResult {
  idx1: number
  idx2: number
}

export interface IGexPlotDisplayProps {
  box: {
    show: boolean
    width: number
    fill: IFillProps
    stroke: IStrokeProps

    median: { stroke: IStrokeProps }
  }
  violin: {
    show: boolean
    fill: IFillProps
    stroke: IStrokeProps
  }
  swarm: {
    show: boolean
    r: number
    fill: IFillProps
    stroke: IStrokeProps
  }
}

export interface IGexDisplayProps {
  title: {
    offset: number
  }
  page: {
    gap: { x: number; y: number }
    cols: number
    scale: number
  }
  axes: {
    x: {
      labels: {
        rotate: boolean
        truncate: number
      }
    }
    y: {
      globalMax: boolean
      offset: number
    }
  }
  // box: {
  //   show: boolean
  //   width: number
  // }
  violin: {
    //show: boolean
    globalNorm: boolean
  }
  plot: {
    gap: number
    bar: { width: number }
    height: number
  }

  cmap: string

  // swarm: {
  //   show: boolean
  //   r: number
  // }

  tpm: {
    log2Mode: boolean
  }

  stats: {
    show: boolean
    line: {
      // how much to offset each stat test line
      offset: number
      // size of drop down lines
      tail: number
    }
    p: {
      cutoff: number
    }
  }
}

export type GexPlotPropMap = { [key: string]: IGexPlotDisplayProps }

export const DEFAULT_GEX_DISPLAY_PROPS: IGexDisplayProps = {
  cmap: 'COO',
  tpm: {
    log2Mode: true,
  },
  plot: {
    gap: 10,
    bar: { width: 50 },
    height: 200,
  },
  // box: {
  //   show: true,
  //   width: 10,
  // },
  // swarm: {
  //   show: false,
  //   r: 2,
  // },
  violin: {
    //show: true,
    globalNorm: false,
  },
  page: {
    cols: 2,
    gap: { x: 150, y: 100 },
    scale: 2,
  },
  axes: {
    y: {
      globalMax: true,
      offset: -20,
    },
    x: {
      labels: {
        rotate: false,
        truncate: -2,
      },
    },
  },

  title: {
    offset: -10,
  },

  stats: {
    p: {
      cutoff: 0.05,
    },
    line: {
      offset: 10,
      tail: 4,
    },
    show: true,
  },
}

export const DEFAULT_GEX_PLOT_DISPLAY_PROPS: IGexPlotDisplayProps = {
  box: {
    median: { stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_RED } },

    show: true,
    width: 10,
    fill: {
      show: true,
      color: COLOR_WHITE,
      alpha: 1,
    },
    stroke: { ...DEFAULT_STROKE_PROPS, width: 1.5 },
  },
  violin: {
    show: true,
    fill: { ...DEFAULT_FILL_PROPS },
    stroke: { ...NO_STROKE_PROPS, width: 1.5 },
  },
  swarm: {
    show: false,
    r: 2,
    fill: {
      ...DEFAULT_FILL_PROPS,
      color: COLOR_WHITE,
    },
    stroke: { ...DEFAULT_STROKE_PROPS },
  },
}
