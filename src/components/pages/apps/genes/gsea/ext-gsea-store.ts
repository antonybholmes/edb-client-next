import { APP_ID } from '@/consts'
import {
  DEFAULT_STROKE_PROPS,
  type IColorProps,
  type IStrokeProps,
} from '@components/plot/svg-props'
import { COLOR_BLUE, COLOR_RED } from '@lib/color/color'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

const SETTINGS_KEY = `${APP_ID}:ext-gsea:settings:v11`

export interface IExtGseaDisplayOptions {
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
    line: IStrokeProps
    height: number

    labels: {
      isColored: boolean
      show: boolean
    }
  }
  es: {
    gs1: {
      line: IStrokeProps
      leadingEdge: {
        show: boolean
        fill: IColorProps
      }
    }
    gs2: {
      line: IStrokeProps
      leadingEdge: {
        show: boolean
        fill: IColorProps
      }
    }
    axes: {
      x: {
        showTicks: boolean
      }
      y: {
        title: string
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
    margin: {
      top: number
      left: number
      bottom: number
      right: number
    }
    gap: { x: number; y: number }
  }

  ranking: {
    zeroCross: { show: boolean }
    show: boolean
    axes: {
      y: {
        length: number
      }
    }
    fill: IColorProps
  }
}

export const DEFAULT_EXT_GSEA_PROPS: IExtGseaDisplayOptions = {
  page: {
    columns: 2,
    scale: 1,
  },

  title: {
    offset: -10,
  },
  plot: {
    margin: {
      top: 100,
      left: 100,
      bottom: 100,
      right: 100,
    },
    gap: {
      x: 20,
      y: 20,
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
        length: 200,
        title: 'ES',
      },
      x: {
        showTicks: false,
      },
    },
    gs1: {
      line: {
        color: COLOR_BLUE,
        width: 2,
        show: true,
        alpha: 1,
      },
      leadingEdge: {
        fill: {
          color: COLOR_BLUE,
          alpha: 0.2,
          show: true,
        },
        show: true,
      },
    },

    gs2: {
      line: {
        color: COLOR_RED,
        width: 2,
        show: true,
        alpha: 1,
      },
      leadingEdge: {
        fill: {
          color: COLOR_RED,
          alpha: 0.2,
          show: true,
        },
        show: true,
      },
    },
  },
  genes: {
    height: 15,
    line: { ...DEFAULT_STROKE_PROPS },
    labels: {
      show: true,
      isColored: true,
    },
  },
  ranking: {
    show: true,
    axes: {
      y: {
        length: 100,
      },
    },
    fill: {
      color: 'gray',
      alpha: 0.2,
      show: true,
    },
    zeroCross: {
      show: true,
    },
  },
}

const extGseaAtom = persistentAtom<IExtGseaDisplayOptions>(
  SETTINGS_KEY,
  { ...DEFAULT_EXT_GSEA_PROPS },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

function setDisplayProps(props: IExtGseaDisplayOptions) {
  extGseaAtom.set(props)
}

function resetDisplayProps() {
  extGseaAtom.set({ ...DEFAULT_EXT_GSEA_PROPS })
}

export function useExtGseaStore(): {
  displayProps: IExtGseaDisplayOptions
  setDisplayProps: (props: IExtGseaDisplayOptions) => void
  resetDisplayProps: () => void
} {
  const displayProps = useStore(extGseaAtom)

  useEffect(() => {
    // auto recreate if deleted and app is running
    if (!displayProps) {
      resetDisplayProps()
    }
  }, [displayProps])

  return { displayProps, setDisplayProps, resetDisplayProps }
}
