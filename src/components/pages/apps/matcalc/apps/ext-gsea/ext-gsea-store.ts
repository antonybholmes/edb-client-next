import {
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type IPaintProps,
  type IStrokeProps,
  type ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { COLOR_BLUE, COLOR_RED } from '@/lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:ext-gsea:settings:v16`

export interface IExtGseaDisplayOptions {
  axes: {
    x: {
      length: number
      font: ITextProps

      labels: {
        rotate: boolean
        truncate: number
        font: ITextProps
      }
    }
  }
  genes: {
    line: IStrokeProps
    height: number

    labels: {
      font: ITextProps
      isColored: boolean
    }
  }
  es: {
    gs1: {
      line: IStrokeProps
      leadingEdge: {
        fill: IPaintProps
      }
    }
    gs2: {
      line: IStrokeProps
      leadingEdge: {
        fill: IPaintProps
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
    fill: IPaintProps
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
      font: { ...DEFAULT_TEXT_PROPS },
      labels: {
        rotate: false,
        truncate: -2,
        font: { ...DEFAULT_BOLD_TEXT_PROPS },
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
      line: { ...DEFAULT_STROKE_PROPS, value: COLOR_BLUE },
      leadingEdge: {
        fill: { ...DEFAULT_FILL_PROPS, value: COLOR_BLUE },
      },
    },

    gs2: {
      line: { ...DEFAULT_STROKE_PROPS, value: COLOR_RED },

      leadingEdge: {
        fill: { ...DEFAULT_FILL_PROPS, value: COLOR_RED },
      },
    },
  },
  genes: {
    height: 15,
    line: { ...DEFAULT_STROKE_PROPS },
    labels: {
      font: { ...DEFAULT_BOLD_TEXT_PROPS },
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
      value: 'gray',
      opacity: 0.2,
      show: true,
    },
    zeroCross: {
      show: true,
    },
  },
}

export interface IExtGseaStore extends IExtGseaDisplayOptions {
  updateSettings: (settings: Partial<IExtGseaDisplayOptions>) => void
}

export const useExtGseaStore = create<IExtGseaStore>()(
  persist(
    set => ({
      ...DEFAULT_EXT_GSEA_PROPS,
      updateSettings: (settings: Partial<IExtGseaDisplayOptions>) => {
        set(state => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const extGseaAtom = persistentAtom<IExtGseaDisplayOptions>(
//   SETTINGS_KEY,
//   { ...DEFAULT_EXT_GSEA_PROPS },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function setDisplayProps(props: IExtGseaDisplayOptions) {
//   extGseaAtom.set(props)
// }

// function resetDisplayProps() {
//   extGseaAtom.set({ ...DEFAULT_EXT_GSEA_PROPS })
// }

export function useExtGsea(): {
  settings: IExtGseaDisplayOptions
  updateSettings: (settings: Partial<IExtGseaStore>) => void
  resetSettings: () => void
} {
  const settings = useExtGseaStore(state => state)
  const updateSettings = useExtGseaStore(state => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_EXT_GSEA_PROPS })

  return { settings, updateSettings, resetSettings }
}
