import {
  DEFAULT_FILL_PROPS,
  DEFAULT_MARGIN,
  DEFAULT_STROKE_PROPS,
  type IFillProps,
  type IMarginProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import {
  COLOR_BLUE,
  COLOR_GRAY,
  COLOR_MEDIUM_SEA_GREEN,
  COLOR_RED,
} from '@/consts'

export interface IPathway {
  name: string
  phen: string
  size: number
  nes: number
  q: number
  rank: number
}

export interface IGeneRankScore {
  gene: string
  rank: number
  score: number
  leading: boolean
}

export interface IGseaResult {
  name: string
  es: IGeneRankScore[]
}

export interface IGseaDisplayProps {
  axes: {
    x: {
      length: number
      labels: {
        rotate: boolean
        truncate: number
      }
    }
  }
  genes: {
    show: boolean
    pos: {
      color: string
    }
    neg: {
      color: string
    }
    height: number
    line: IStrokeProps
  }
  es: {
    labels: { show: boolean; isColored: boolean }
    show: boolean
    line: IStrokeProps
    leadingEdge: {
      show: boolean
      fill: IFillProps
    }
    axes: {
      x: {
        showTicks: boolean
      }
      y: {
        length: number
      }
    }
  }
  title: {
    offset: number
  }
  page: {
    scale: number
    columns: number
  }
  plot: {
    margin: IMarginProps
    gap: {
      x: number
      y: number
    }
  }

  ranking: {
    zeroCross: { show: boolean }
    show: boolean
    axes: {
      y: {
        length: number
      }
    }
    fill: IFillProps
  }
}

export const DEFAULT_GSEA_DISPLAY_PROPS: IGseaDisplayProps = {
  page: {
    columns: 2,
    scale: 1,
  },

  title: {
    offset: -10,
  },
  plot: {
    margin: { ...DEFAULT_MARGIN },
    gap: {
      y: 20,
      x: 20,
    },
  },
  axes: {
    x: {
      labels: {
        rotate: false,
        truncate: -2,
      },
      length: 300,
    },
  },
  es: {
    axes: {
      y: {
        length: 150,
      },
      x: {
        showTicks: false,
      },
    },
    line: { ...DEFAULT_STROKE_PROPS, color: COLOR_MEDIUM_SEA_GREEN, width: 2 },
    leadingEdge: {
      fill: { ...DEFAULT_FILL_PROPS, color: COLOR_MEDIUM_SEA_GREEN },
      show: true,
    },
    show: true,
    labels: {
      show: true,
      isColored: true,
    },
  },
  genes: {
    height: 15,
    pos: {
      color: COLOR_RED,
    },
    neg: {
      color: COLOR_BLUE,
    },
    show: true,
    line: { ...DEFAULT_STROKE_PROPS, width: 2 },
  },
  ranking: {
    show: true,
    axes: {
      y: {
        length: 100,
      },
    },
    fill: { ...DEFAULT_FILL_PROPS, color: COLOR_GRAY },
    zeroCross: {
      show: true,
    },
  },
}
